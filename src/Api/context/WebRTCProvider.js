import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
} from 'react-native-webrtc';
import {useWebSocket} from './WebSocketServices';
import {Alert} from 'react-native';

const WebRTCContext = createContext(null);
export const useWebRTC = () => useContext(WebRTCContext);

const configuration = {
  iceServers: [{urls: 'stun:stun.l.google.com:19302'}],
};

export const WebRTCProvider = ({children}) => {
  const {lastMessage, sendMessage} = useWebSocket();
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callState, setCallState] = useState('idle');
  const [callData, setCallData] = useState(null);

  // console.log(
  //   '[WebRTC] Action: Initializing WebRTCProvider...',
  //   callData,
  //   '\n',
  //   '\n',
  // );

  const peerConnection = useRef(null);
  const callStateRef = useRef(callState);
  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  const initiateCall = useCallback(
    (calleeId, isVideo = false) => {
      console.log('[WebRTC] Action: Initiating call...');
      setCallState('outgoing');
      const object = {
        action: 'start_call',
        call_type: isVideo ? 'video' : 'voice',
        recipient_id: calleeId,
      };

      console.log(
        '[WebRTC] Action: Sending call initiation message to server...',
        object,
      );
      sendMessage({
        action: 'start_call',
        call_type: isVideo ? 'video' : 'voice',
        recipient_id: calleeId,
      });
    },
    [sendMessage],
  );

  useEffect(() => {
    if (!lastMessage) return;

    // Log all incoming WebSocket messages for debugging
    // console.log(
    //   '[WebRTC] Incoming WebSocket message:',
    //   JSON.stringify(lastMessage),
    //   '| Current callState:',
    //   callStateRef.current,
    // );

    const eventType = lastMessage.message || lastMessage.action;
    const {data} = lastMessage;

    const createPeerConnection = currentCallData => {
      const pc = new RTCPeerConnection(configuration);
      const icePromise = new Promise(resolve => {
        pc.onicecandidate = event => {
          if (!event.candidate) resolve();
        };
      });

      pc.onconnectionstatechange = () => {
        console.log(`[WebRTC] Connection State Changed: ${pc.connectionState}`);
        if (pc.connectionState === 'failed') {
          console.error(
            '[WebRTC] FATAL: Peer connection failed. Check STUN/TURN servers and network.',
          );
          endCall(false);
        }
      };

      pc.onaddstream = event => {
        if (event.stream) {
          console.log('[WebRTC] SUCCESS: Remote stream received!');
          console.log(
            `[WebRTC] Remote stream has ${
              event.stream.getTracks().length
            } tracks.`,
          );
          setRemoteStream(event.stream);
        } else {
          console.error(
            '[WebRTC] FATAL: "onaddstream" event fired but the stream is null!',
          );
        }
      };

      return {pc, icePromise};
    };

    switch (eventType) {
      case 'receive_call':
        if (callStateRef.current === 'idle') {
          console.log('[WebRTC] Logic: Handling incoming call notification.');
          setCallState('incoming');
          setCallData(data);
        }
        break;
      case 'receive_call_busy':
        if (callStateRef.current === 'outgoing') {
          Alert.alert(
            'User Busy',
            'The person you are calling is on another call.',
          );
          endCall(false);
        }
        break;
      case 'Call initiated':
        if (callStateRef.current === 'outgoing') {
          console.log(
            '[WebRTC] Logic: Server confirmed call, creating offer...',
          );
          setCallData(data);
          const createAndSendOffer = async () => {
            try {
              const {pc, icePromise} = createPeerConnection(data);
              peerConnection.current = pc;

              const isVideo = data.call_type?.includes('video');
              const stream = await mediaDevices.getUserMedia({
                audio: true,
                video: isVideo,
              });
              setLocalStream(stream);
              stream.getTracks().forEach(track => pc.addTrack(track, stream));

              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              await icePromise;

              console.log(
                '[WebRTC] Action: Sending bundled offer to server...',
              );
              sendMessage({
                action: 'answer_call',
                call_id: data.call_id,
                answer: true,
                sdp_offer: pc.localDescription,
              });
            } catch (error) {
              console.error(
                '[WebRTC] FATAL: Error in createAndSendOffer (check permissions):',
                error,
              );
              endCall();
            }
          };
          createAndSendOffer();
        }
        break;

      case 'receive_call_answered':
        if (!data.sdp_offer) break;

        if (callStateRef.current === 'incoming') {
          console.log(
            "[WebRTC] Logic: Received caller's offer. Ready to answer.",
          );
          setCallData(data);
          const {pc} = createPeerConnection(data);
          peerConnection.current = pc;
          pc.setRemoteDescription(new RTCSessionDescription(data.sdp_offer));
        } else if (callStateRef.current === 'outgoing') {
          console.log(
            "[WebRTC] Logic: Received receiver's answer. Connecting call.",
          );
          if (peerConnection.current) {
            peerConnection.current.setRemoteDescription(
              new RTCSessionDescription(data.sdp_offer),
            );
            setCallState('connected');
          }
        }
        break;

      case 'receive_call_rejected':
      case 'receive_user_left':
        endCall(false);
        break;
    }
  }, [lastMessage, sendMessage]);

  const answerCall = useCallback(async () => {
    if (!peerConnection.current || !callData) {
      console.error(
        '[WebRTC] FATAL: Cannot answer, peer connection or call data is missing.',
      );
      return;
    }

    console.log('[WebRTC] Action: Answering call...');
    try {
      const isVideo = callData.call_type?.includes('video');
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: isVideo,
      });
      setLocalStream(stream);
      stream
        .getTracks()
        .forEach(track => peerConnection.current.addTrack(track, stream));

      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      const icePromise = new Promise(resolve => {
        peerConnection.current.onicecandidate = event => {
          if (!event.candidate) resolve();
        };
      });
      await icePromise;

      console.log('[WebRTC] Action: Sending bundled answer to server...');
      sendMessage({
        action: 'answer_call',
        call_id: callData.call_id,
        answer: true,
        sdp_offer: peerConnection.current.localDescription,
      });
      setCallState('connected');
    } catch (error) {
      console.error(
        '[WebRTC] FATAL: Error in answerCall (check permissions):',
        error,
      );
      endCall();
    }
  }, [callData, sendMessage]);

  const endCall = (shouldSendMessage = true) => {
    console.log('[WebRTC] Action: Ending call.');
    // Always try to notify server, even if callData is missing
    try {
      if (callData?.call_id) {
        sendMessage({action: 'hangup_call', call_id: callData.call_id});
      }
    } catch (e) {
      console.warn('[WebRTC] Could not send hangup_call:', e);
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setCallData(null);
    setTimeout(() => {
      setCallState('idle');
      console.log('[WebRTC] Call state reset to idle.');
    }, 300);
  };

  // Cleanup on unmount: always notify server to clear busy state
  React.useEffect(() => {
    return () => {
      if (callData?.call_id) {
        try {
          sendMessage({action: 'hangup_call', call_id: callData.call_id});
          console.log('[WebRTC] Cleanup: hangup_call sent on unmount');
        } catch (e) {
          console.warn('[WebRTC] Cleanup: Could not send hangup_call:', e);
        }
      }
    };
  }, [callData, sendMessage]);

  const value = {
    localStream,
    remoteStream,
    callState,
    callData,
    initiateCall,
    answerCall,
    endCall,
  };

  return (
    <WebRTCContext.Provider value={value}>{children}</WebRTCContext.Provider>
  );
};

// ///
// //
// ///

// import React, {
//   createContext,
//   useContext,
//   useState,
//   useRef,
//   useEffect,
//   useCallback,
// } from 'react';
// import {
//   RTCPeerConnection,
//   RTCSessionDescription,
//   RTCIceCandidate,
//   mediaDevices,
// } from 'react-native-webrtc';
// import {useWebSocket} from './WebSocketServices';
// import {Alert} from 'react-native';

// const WebRTCContext = createContext(null);
// export const useWebRTC = () => useContext(WebRTCContext);

// const configuration = {
//   iceServers: [{urls: 'stun:stun.l.google.com:19302'}],
// };

// export const WebRTCProvider = ({children}) => {
//   const {lastMessage, sendMessage} = useWebSocket();
//   const [localStream, setLocalStream] = useState(null);
//   const [remoteStream, setRemoteStream] = useState(null);
//   const [callState, setCallState] = useState('idle');
//   const [callData, setCallData] = useState(null);

//   const peerConnection = useRef(null);
//   const callStateRef = useRef(callState);
//   useEffect(() => {
//     callStateRef.current = callState;
//   }, [callState]);

//   const initiateCall = useCallback(
//     (calleeId, isVideo = false) => {
//       console.log('[WebRTC] Action: Initiating call...');
//       setCallState('outgoing');
//       sendMessage({
//         action: 'start_call',
//         call_type: isVideo ? 'video' : 'voice',
//         recipient_id: calleeId,
//       });
//     },
//     [sendMessage],
//   );

//   useEffect(() => {
//     if (!lastMessage) return;

//     const eventType = lastMessage.message || lastMessage.action;
//     const {data} = lastMessage;

//     console.log(
//       `[WebRTC] Event: '${eventType}' | Current State: '${callStateRef.current}'`,
//       lastMessage,
//     );

//     const createPeerConnection = currentCallData => {
//       const pc = new RTCPeerConnection(configuration);
//       const icePromise = new Promise(resolve => {
//         pc.onicecandidate = event => {
//           if (!event.candidate) resolve();
//         };
//       });

//       // *** NEW DEBUG LOGGING: The most important listener ***
//       pc.onconnectionstatechange = () => {
//         console.log(`[WebRTC] Connection State Changed: ${pc.connectionState}`);
//         if (pc.connectionState === 'failed') {
//           console.error(
//             '[WebRTC] FATAL: Peer connection failed. Check STUN/TURN servers and network.',
//           );
//           endCall(false); // End the call if the connection fails
//         }
//       };

//       pc.onaddstream = event => {
//         if (event.stream) {
//           console.log('[WebRTC] SUCCESS: Remote stream received!');
//           console.log(
//             `[WebRTC] Remote stream has ${
//               event.stream.getTracks().length
//             } tracks.`,
//           );
//           setRemoteStream(event.stream);
//         } else {
//           console.error(
//             '[WebRTC] FATAL: "onaddstream" event fired but the stream is null!',
//           );
//         }
//       };

//       return {pc, icePromise};
//     };

//     switch (eventType) {
//       case 'receive_call':
//         if (callStateRef.current === 'idle') {
//           console.log('[WebRTC] Logic: Handling incoming call notification.');
//           setCallState('incoming');
//           setCallData(data);
//         }
//         break;
//       case 'receive_call_busy':
//         if (callStateRef.current === 'outgoing') {
//           Alert.alert(
//             'User Busy',
//             'The person you are calling is on another call.',
//           );
//           endCall(false);
//         }
//         break;
//       case 'Call initiated':
//         if (callStateRef.current === 'outgoing') {
//           console.log(
//             '[WebRTC] Logic: Server confirmed call, creating offer...',
//           );
//           setCallData(data);
//           const createAndSendOffer = async () => {
//             try {
//               const {pc, icePromise} = createPeerConnection(data);
//               peerConnection.current = pc;

//               const isVideo = data.call_type?.includes('video');
//               const stream = await mediaDevices.getUserMedia({
//                 audio: true,
//                 video: isVideo,
//               });
//               setLocalStream(stream);
//               stream.getTracks().forEach(track => pc.addTrack(track, stream));

//               const offer = await pc.createOffer();
//               await pc.setLocalDescription(offer);
//               await icePromise;

//               console.log(
//                 '[WebRTC] Action: Sending bundled offer to server...',
//               );
//               sendMessage({
//                 action: 'answer_call', // This should be 'send_offer' or similar for the caller
//                 call_id: data.call_id,
//                 sdp_offer: pc.localDescription,
//               });
//             } catch (error) {
//               console.error(
//                 '[WebRTC] FATAL: Error in createAndSendOffer (check permissions):',
//                 error,
//               );
//               endCall();
//             }
//           };
//           createAndSendOffer();
//         }
//         break;

//       case 'receive_call_answered':
//         if (!data.sdp_offer) {
//           console.warn(
//             '[WebRTC] Warning: No SDP offer in receive_call_answered.',
//           );
//           break;
//         }

//         if (callStateRef.current === 'incoming') {
//           console.log(
//             "[WebRTC] Logic: Received caller's offer. Ready to answer.",
//           );
//           setCallData(data);
//           const answerTheCall = async () => {
//             // Encapsulate in an async function
//             try {
//               const {pc, icePromise} = createPeerConnection(data); // Create PC here
//               peerConnection.current = pc;

//               // Set remote description first
//               await pc.setRemoteDescription(
//                 new RTCSessionDescription(data.sdp_offer),
//               );

//               // Get local media
//               const isVideo = data.call_type?.includes('video');
//               const stream = await mediaDevices.getUserMedia({
//                 audio: true,
//                 video: isVideo,
//               });
//               setLocalStream(stream);
//               stream.getTracks().forEach(track => pc.addTrack(track, stream));

//               // Create and set local answer
//               const answer = await pc.createAnswer();
//               await pc.setLocalDescription(answer);
//               await icePromise; // Wait for ICE candidates

//               console.log(
//                 '[WebRTC] Action: Sending bundled answer to server...',
//               );
//               sendMessage({
//                 action: 'answer_call',
//                 call_id: data.call_id,
//                 answer: true,
//                 sdp_answer: pc.localDescription, // Send SDP Answer, not Offer
//               });
//               setCallState('connected');
//             } catch (error) {
//               console.error('[WebRTC] FATAL: Error answering call:', error);
//               endCall();
//             }
//           };
//           answerTheCall(); // Call the async function
//         } else if (callStateRef.current === 'outgoing') {
//           console.log(
//             "[WebRTC] Logic: Received receiver's answer. Connecting call.",
//           );
//           if (peerConnection.current && data.sdp_answer) {
//             // Expecting sdp_answer here
//             peerConnection.current.setRemoteDescription(
//               new RTCSessionDescription(data.sdp_answer),
//             );
//             setCallState('connected');
//           } else {
//             console.error(
//               '[WebRTC] FATAL: Missing peerConnection or SDP answer for outgoing call.',
//             );
//             endCall();
//           }
//         }
//         break;

//       case 'receive_call_rejected':
//       case 'receive_user_left':
//         endCall(false);
//         break;
//     }
//   }, [lastMessage, sendMessage]);

//   const answerCall = useCallback(async () => {
//     // This function might become redundant or need refactoring depending on your server logic
//     // The main logic for answering an incoming call is now within the useEffect.
//     // However, if your UI calls this directly, ensure callData and peerConnection.current are properly set.
//     if (!peerConnection.current || !callData) {
//       console.error(
//         '[WebRTC] FATAL: Cannot answer, peer connection or call data is missing.',
//       );
//       return;
//     }

//     console.log('[WebRTC] Action: Answering call via direct user action...');
//     try {
//       const isVideo = callData.call_type?.includes('video');
//       const stream = await mediaDevices.getUserMedia({
//         audio: true,
//         video: isVideo,
//       });
//       setLocalStream(stream);
//       stream
//         .getTracks()
//         .forEach(track => peerConnection.current.addTrack(track, stream));

//       const answer = await peerConnection.current.createAnswer();
//       await peerConnection.current.setLocalDescription(answer);

//       const icePromise = new Promise(resolve => {
//         peerConnection.current.onicecandidate = event => {
//           if (!event.candidate) resolve();
//         };
//       });
//       await icePromise;

//       console.log(
//         '[WebRTC] Action: Sending bundled answer to server (from answerCall function)...',
//       );
//       sendMessage({
//         action: 'answer_call',
//         call_id: callData.call_id,
//         answer: true,
//         sdp_answer: peerConnection.current.localDescription, // Send SDP Answer
//       });
//       setCallState('connected');
//     } catch (error) {
//       console.error(
//         '[WebRTC] FATAL: Error in answerCall (check permissions):',
//         error,
//       );
//       endCall();
//     }
//   }, [callData, sendMessage]);

//   const endCall = (shouldSendMessage = true) => {
//     console.log('[WebRTC] Action: Ending call.');
//     if (shouldSendMessage && callData?.call_id) {
//       sendMessage({action: 'hangup_call', call_id: callData.call_id});
//     }
//     if (localStream) {
//       localStream.getTracks().forEach(track => track.stop());
//       setLocalStream(null); // Clear local stream state
//     }
//     if (remoteStream) {
//       // remoteStream.getTracks().forEach(track => track.stop()); // Not strictly necessary for remote
//       setRemoteStream(null); // Clear remote stream state
//     }
//     if (peerConnection.current) {
//       peerConnection.current.close();
//       peerConnection.current = null;
//     }

//     setCallState('idle');
//     setCallData(null);
//   };

//   const value = {
//     localStream,
//     remoteStream,
//     callState,
//     callData,
//     initiateCall,
//     answerCall,
//     endCall,
//   };

//   return (
//     <WebRTCContext.Provider value={value}>{children}</WebRTCContext.Provider>
//   );
// };

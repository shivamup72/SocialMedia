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
// import {v4 as uuidv4} from 'uuid';

// const callId = uuidv4();

// console.log(callId, 'jhaskjdasdha');

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

//   // console.log(
//   //   '[WebRTC] Action: Initializing WebRTCProvider...',
//   //   callData,
//   //   '\n',
//   //   '\n',
//   // );

//   const peerConnection = useRef(null);
//   const callStateRef = useRef(callState);
//   useEffect(() => {
//     callStateRef.current = callState;
//   }, [callState]);

//   const initiateCall = useCallback(
//     (calleeId, isVideo = false) => {
//       console.log('[WebRTC] Action: Initiating call...');
//       setCallState('outgoing');
//       const object = {
//         action: 'start_call',
//         call_type: isVideo ? 'video' : 'voice',
//         recipient_id: calleeId,
//       };

//       console.log(
//         '[WebRTC] Action: Sending call initiation message to server...',
//         object,
//       );
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

//     // Log all incoming WebSocket messages for debugging
//     // console.log(
//     //   '[WebRTC] Incoming WebSocket message:',
//     //   JSON.stringify(lastMessage),
//     //   '| Current callState:',
//     //   callStateRef.current,
//     // );

//     const eventType = lastMessage.message || lastMessage.action;
//     const {data} = lastMessage;

//     const createPeerConnection = currentCallData => {
//       const pc = new RTCPeerConnection(configuration);
//       const icePromise = new Promise(resolve => {
//         pc.onicecandidate = event => {
//           if (!event.candidate) resolve();
//         };
//       });

//       pc.onconnectionstatechange = () => {
//         console.log(`[WebRTC] Connection State Changed: ${pc.connectionState}`);
//         if (pc.connectionState === 'failed') {
//           console.error(
//             '[WebRTC] FATAL: Peer connection failed. Check STUN/TURN servers and network.',
//           );
//           endCall(false);
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
//                 action: 'answer_call',
//                 call_id: data.call_id,
//                 answer: true,
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
//         if (!data.sdp_offer) break;

//         if (callStateRef.current === 'incoming') {
//           console.log(
//             "[WebRTC] Logic: Received caller's offer. Ready to answer.",
//           );
//           setCallData(data);
//           const {pc} = createPeerConnection(data);
//           peerConnection.current = pc;
//           pc.setRemoteDescription(new RTCSessionDescription(data.sdp_offer));
//         } else if (callStateRef.current === 'outgoing') {
//           console.log(
//             "[WebRTC] Logic: Received receiver's answer. Connecting call.",
//           );
//           if (peerConnection.current) {
//             peerConnection.current.setRemoteDescription(
//               new RTCSessionDescription(data.sdp_offer),
//             );
//             setCallState('connected');
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
//     if (!peerConnection.current || !callData) {
//       console.error(
//         '[WebRTC] FATAL: Cannot answer, peer connection or call data is missing.',
//       );
//       return;
//     }

//     console.log('[WebRTC] Action: Answering call...');
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

//       console.log('[WebRTC] Action: Sending bundled answer to server...');
//       sendMessage({
//         action: 'answer_call',
//         call_id: callData.call_id,
//         answer: true,
//         sdp_offer: peerConnection.current.localDescription,
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
//     // Always try to notify server, even if callData is missing
//     try {
//       if (callData?.call_id) {
//         sendMessage({action: 'hangup_call', call_id: callData.call_id});
//       }
//     } catch (e) {
//       console.warn('[WebRTC] Could not send hangup_call:', e);
//     }
//     if (localStream) {
//       localStream.getTracks().forEach(track => track.stop());
//     }
//     if (peerConnection.current) {
//       peerConnection.current.close();
//       peerConnection.current = null;
//     }
//     setLocalStream(null);
//     setRemoteStream(null);
//     setCallData(null);
//     setTimeout(() => {
//       setCallState('idle');
//       console.log('[WebRTC] Call state reset to idle.');
//     }, 300);
//   };

//   // Cleanup on unmount: always notify server to clear busy state
//   React.useEffect(() => {
//     return () => {
//       if (callData?.call_id) {
//         try {
//           sendMessage({action: 'hangup_call', call_id: callData.call_id});
//           console.log('[WebRTC] Cleanup: hangup_call sent on unmount');
//         } catch (e) {
//           console.warn('[WebRTC] Cleanup: Could not send hangup_call:', e);
//         }
//       }
//     };
//   }, [callData, sendMessage]);

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
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import {useSelector} from 'react-redux';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
} from 'react-native-webrtc';
import {useWebSocket} from './WebSocketServices';
import {v4 as uuidv4} from 'uuid';
import AsyncStorage1 from '../config/AsyncStorage';

const WebRTCContext = createContext(null);
export const useWebRTC = () => useContext(WebRTCContext);

const configuration = {
  iceServers: [{urls: 'stun:stun.l.google.com:19302'}],
};

export const WebRTCProvider = ({children}) => {
  const {lastMessage, sendMessage} = useWebSocket();
  const user = useSelector(state => state.auth.user);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callState, setCallState] = useState('idle'); // idle | outgoing | incoming | connected
  const [callData, setCallData] = useState(null);
  const [callId, setCallId] = useState(null);
  const [conversationId, setConversationId] = useState(null);

  const peerConnection = useRef(null);
  const callStateRef = useRef(callState);
  const conversationIdRef = useRef(conversationId);
  const callIdRef = useRef(callId);
  const callDataRef = useRef(callData);
  const localStreamRef = useRef(localStream);
  // Track recently ended callIds and their end times
  const recentlyEndedCallsRef = useRef([]); // [{callId, time}]

  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  useEffect(() => {
    conversationIdRef.current = conversationId;
    if (conversationId) {
      AsyncStorage1.setItem('conversationId', String(conversationId));
    }
  }, [conversationId]);

  useEffect(() => {
    callIdRef.current = callId;
  }, [callId]);

  useEffect(() => {
    callDataRef.current = callData;
  }, [callData]);

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  const cleanupMediaAndConnection = useCallback(() => {
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    } catch (e) {
      console.log('[WebRTC] cleanup local stream error:', e);
    }

    try {
      if (peerConnection.current) {
        peerConnection.current.onicecandidate = null;
        peerConnection.current.ontrack = null;
        peerConnection.current.onaddstream = null;
        peerConnection.current.onconnectionstatechange = null;
        peerConnection.current.close();
        peerConnection.current = null;
      }
    } catch (e) {
      console.log('[WebRTC] cleanup peer connection error:', e);
    }

    setLocalStream(null);
    setRemoteStream(null);
  }, []);

  const resetCallState = useCallback(() => {
    setCallData(null);
    setCallId(null);
    setConversationId(null);
    callIdRef.current = null;
    conversationIdRef.current = null;
    callDataRef.current = null;
    setCallState('idle');
  }, []);

  const endCall = useCallback(
    (shouldSendMessage = true) => {
      const currentCallId = callIdRef.current;
      const currentConversationId =
        conversationIdRef.current || callDataRef.current?.conversation_id;
      const targetUserId =
        callDataRef.current?.from_user_id || callDataRef.current?.to_user_id;

      console.log('[WebRTC] Ending call...', {
        currentCallId,
        currentConversationId,
        targetUserId,
      });

      // Track recently ended callIds for 10 seconds
      if (currentCallId) {
        const now = Date.now();
        recentlyEndedCallsRef.current = [
          ...recentlyEndedCallsRef.current.filter(
            c => now - c.time < 10000, // keep only last 10s
          ),
          {callId: currentCallId, time: now},
        ];
      }

      try {
        if (shouldSendMessage && currentCallId) {
          sendMessage({
            action: 'call_end',
            call_id: currentCallId,
            conversation_id: currentConversationId,
            to_user_id: targetUserId,
            recipient_id: targetUserId,
            from_user_id: user?.id,
            from_user_name: user?.name,
          });
          console.log('[WebRTC] Sent call_end');
        }
      } catch (e) {
        console.warn('[WebRTC] Could not send call_end:', e);
      }

      cleanupMediaAndConnection();
      resetCallState();
    },
    [cleanupMediaAndConnection, resetCallState, sendMessage, user],
  );

  const createPeerConnection = useCallback(
    currentCallData => {
      const pc = new RTCPeerConnection(configuration);

      pc.onconnectionstatechange = () => {
        console.log('[WebRTC] Connection state:', pc.connectionState);

        if (
          pc.connectionState === 'failed' ||
          pc.connectionState === 'disconnected' ||
          pc.connectionState === 'closed'
        ) {
          console.log('[WebRTC] Connection ended/failed, cleaning up');
        }
      };

      pc.ontrack = event => {
        if (event?.streams && event.streams[0]) {
          console.log('[WebRTC] Remote stream received via ontrack');
          setRemoteStream(event.streams[0]);
        }
      };

      // Backward compatibility
      pc.onaddstream = event => {
        if (event?.stream) {
          console.log('[WebRTC] Remote stream received via onaddstream');
          setRemoteStream(event.stream);
        }
      };

      pc.onicecandidate = event => {
        if (event.candidate) {
          const targetUserId =
            currentCallData?.from_user_id || currentCallData?.to_user_id;

          const payload = {
            action: 'call_ice_candidate',
            call_id: callIdRef.current,
            conversation_id:
              conversationIdRef.current || currentCallData?.conversation_id,
            to_user_id: targetUserId,
            recipient_id: targetUserId,
            from_user_id: user?.id,
            from_user_name: user?.name,
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
          };

          console.log('[WebRTC] Sending ICE candidate:', payload);
          sendMessage(payload);
        } else {
          console.log('[WebRTC] ICE gathering completed');
        }
      };

      peerConnection.current = pc;
      return pc;
    },
    [sendMessage, user],
  );

  const waitForIceGatheringComplete = async pc => {
    if (!pc) return;

    if (pc.iceGatheringState === 'complete') {
      return;
    }

    await new Promise(resolve => {
      const checkState = () => {
        if (pc.iceGatheringState === 'complete') {
          pc.removeEventListener?.('icegatheringstatechange', checkState);
          resolve();
        }
      };

      if (pc.addEventListener) {
        pc.addEventListener('icegatheringstatechange', checkState);
      } else {
        const original = pc.onicegatheringstatechange;
        pc.onicegatheringstatechange = () => {
          if (original) original();
          checkState();
        };
      }

      setTimeout(resolve, 3000);
    });
  };

  const initiateCall = useCallback(
    async (calleeId, isVideo = false, incomingConversationId = null) => {
      try {
        const usedConversationId =
          incomingConversationId || conversationIdRef.current;

        if (!usedConversationId) {
          console.log('[WebRTC] conversation_id missing in initiateCall');
          return;
        }

        const newCallId = uuidv4();

        setCallId(newCallId);
        callIdRef.current = newCallId;

        setConversationId(usedConversationId);
        conversationIdRef.current = usedConversationId;

        const outgoingData = {
          call_id: newCallId,
          conversation_id: usedConversationId,
          to_user_id: calleeId,
          recipient_id: calleeId,
          from_user_id: user?.id,
          from_user_name: user?.name,
          call_type: isVideo ? 'video' : 'audio',
          is_group: false,
        };

        setCallData(outgoingData);
        callDataRef.current = outgoingData;
        setCallState('outgoing');

        const invitePayload = {
          action: 'call_invite',
          ...outgoingData,
        };

        console.log('[WebRTC] Sending call_invite:', invitePayload);
        sendMessage(invitePayload);

        // immediate call_offer
        const pc = createPeerConnection(outgoingData);

        const stream = await mediaDevices.getUserMedia({
          audio: true,
          video: isVideo,
        });

        setLocalStream(stream);
        localStreamRef.current = stream;

        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });

        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: isVideo,
        });

        await pc.setLocalDescription(offer);
        await waitForIceGatheringComplete(pc);

        const offerPayload = {
          action: 'call_offer',
          call_id: newCallId,
          conversation_id: usedConversationId,
          to_user_id: calleeId,
          recipient_id: calleeId,
          from_user_id: user?.id,
          from_user_name: user?.name,
          call_type: isVideo ? 'video' : 'audio',
          type: 'offer',
          sdp: pc.localDescription?.sdp || offer.sdp,
        };

        console.log('[WebRTC] Sending immediate call_offer:', offerPayload);
        sendMessage(offerPayload);
      } catch (error) {
        console.error('[WebRTC] Error in initiateCall:', error);
        endCall(false);
      }
    },
    [createPeerConnection, endCall, sendMessage, user],
  );

  const answerCall = useCallback(async () => {
    try {
      const currentCallData = callDataRef.current;
      const currentCallId = callIdRef.current;
      const currentConversationId =
        conversationIdRef.current || currentCallData?.conversation_id;

      if (!peerConnection.current || !currentCallData || !currentCallId) {
        console.error(
          '[WebRTC] Cannot answer: missing peerConnection/callData/callId',
        );
        return;
      }

      const isVideo = currentCallData?.call_type?.includes('video');

      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: isVideo,
      });

      setLocalStream(stream);
      localStreamRef.current = stream;

      stream.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, stream);
      });

      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      await waitForIceGatheringComplete(peerConnection.current);

      const targetUserId =
        currentCallData?.from_user_id || currentCallData?.to_user_id;

      const answerPayload = {
        action: 'call_answer_sdp',
        call_id: currentCallId,
        conversation_id: currentConversationId,
        to_user_id: targetUserId,
        recipient_id: targetUserId,
        from_user_id: user?.id,
        from_user_name: user?.name,
        type: 'answer',
        sdp: peerConnection.current.localDescription?.sdp || answer.sdp,
      };

      console.log('[WebRTC] Sending call_answer_sdp:', answerPayload);
      sendMessage(answerPayload);
      setCallState('connected');
    } catch (error) {
      console.error('[WebRTC] Error in answerCall:', error);
      endCall(false);
    }
  }, [endCall, sendMessage, user]);

  useEffect(() => {
    if (!lastMessage) return;

    const action = lastMessage?.action || lastMessage?.message;
    const payload = lastMessage?.data
      ? {...lastMessage, ...lastMessage.data}
      : lastMessage;

    // ...existing code...

    switch (action) {
      case 'call_invite': {
        const now = Date.now();
        // Prevent handling new incoming calls unless state is idle
        if (callStateRef.current !== 'idle') {
          console.log('[WebRTC] Ignoring call_invite: not idle', {
            currentState: callStateRef.current,
            callId: callIdRef.current,
            conversationId: conversationIdRef.current,
            payload,
          });
          return;
        }

        // Extra guard: if the incoming call_id matches the current, ignore
        if (callIdRef.current && callIdRef.current === payload?.call_id) {
          console.log(
            '[WebRTC] Ignoring duplicate call_invite for same call_id',
            payload?.call_id,
          );
          return;
        }

        // Ignore call_invite if it matches any recently ended callId within 10 seconds
        const recent = recentlyEndedCallsRef.current.find(
          c => c.callId === payload?.call_id && now - c.time < 10000,
        );
        if (recent) {
          console.log(
            '[WebRTC] Ignoring call_invite for recently ended call',
            payload?.call_id,
            'recentlyEndedCalls:',
            recentlyEndedCallsRef.current,
          );
          return;
        }

        // Reset state before processing new call
        setCallId(null);
        callIdRef.current = null;
        setConversationId(null);
        conversationIdRef.current = null;
        setCallData(null);
        callDataRef.current = null;
        setCallState('idle');

        // Now process the new call
        const incomingCallId = payload?.call_id;
        const incomingConversationId = payload?.conversation_id;

        setCallId(incomingCallId);
        callIdRef.current = incomingCallId;

        setConversationId(incomingConversationId);
        conversationIdRef.current = incomingConversationId;

        setCallData(payload);
        callDataRef.current = payload;

        setCallState('incoming');
        console.log('[WebRTC] Received call_invite', {
          incomingCallId,
          incomingConversationId,
          payload,
          recentlyEndedCalls: recentlyEndedCallsRef.current,
        });
        break;
      }

      case 'receive_call_offer':
      case 'call_offer': {
        const incomingCallId = payload?.call_id;
        const incomingConversationId = payload?.conversation_id;

        if (incomingCallId) {
          setCallId(incomingCallId);
          callIdRef.current = incomingCallId;
        }

        if (incomingConversationId) {
          setConversationId(incomingConversationId);
          conversationIdRef.current = incomingConversationId;
        }

        setCallData(payload);
        callDataRef.current = payload;

        if (!peerConnection.current) {
          createPeerConnection(payload);
        }

        if (payload?.sdp) {
          peerConnection.current
            .setRemoteDescription(
              new RTCSessionDescription({
                type: payload?.type || 'offer',
                sdp: payload.sdp,
              }),
            )
            .then(() => {
              console.log('[WebRTC] Remote offer set successfully');
            })
            .catch(error => {
              console.error('[WebRTC] Error setting remote offer:', error);
            });
        }
        break;
      }

      case 'receive_call_answer_sdp':
      case 'call_answer_sdp': {
        if (!peerConnection.current || !payload?.sdp) return;

        peerConnection.current
          .setRemoteDescription(
            new RTCSessionDescription({
              type: payload?.type || 'answer',
              sdp: payload.sdp,
            }),
          )
          .then(() => {
            setCallState('connected');
            console.log('[WebRTC] Remote answer set, call connected');
          })
          .catch(error => {
            console.error('[WebRTC] Error setting remote answer:', error);
          });

        break;
      }

      case 'receive_call_ice_candidate':
      case 'call_ice_candidate': {
        if (!peerConnection.current || !payload?.candidate) return;

        peerConnection.current
          .addIceCandidate(
            new RTCIceCandidate({
              candidate: payload.candidate,
              sdpMid: payload.sdpMid,
              sdpMLineIndex: payload.sdpMLineIndex,
            }),
          )
          .then(() => {
            console.log('[WebRTC] ICE candidate added');
          })
          .catch(error => {
            console.error('[WebRTC] Error adding ICE candidate:', error);
          });

        break;
      }

      case 'call_end':
      case 'receive_user_left':
      case 'receive_participant_left': {
        console.log('[WebRTC] Remote side ended call');
        endCall(false);
        break;
      }

      default:
        break;
    }
  }, [createPeerConnection, endCall, lastMessage]);

  useEffect(() => {
    return () => {
      try {
        if (callIdRef.current) {
          sendMessage({
            action: 'call_end',
            call_id: callIdRef.current,
            conversation_id:
              conversationIdRef.current || callDataRef.current?.conversation_id,
            to_user_id:
              callDataRef.current?.from_user_id ||
              callDataRef.current?.to_user_id,
            recipient_id:
              callDataRef.current?.from_user_id ||
              callDataRef.current?.to_user_id,
            from_user_id: user?.id,
            from_user_name: user?.name,
          });
          console.log('[WebRTC] Cleanup call_end sent');
        }
      } catch (e) {
        console.warn('[WebRTC] Cleanup send error:', e);
      }

      cleanupMediaAndConnection();
    };
  }, [cleanupMediaAndConnection, sendMessage, user]);

  const value = {
    localStream,
    remoteStream,
    callState,
    callData,
    callId,
    conversationId,
    initiateCall,
    answerCall,
    endCall,
  };

  return (
    <WebRTCContext.Provider value={value}>{children}</WebRTCContext.Provider>
  );
};

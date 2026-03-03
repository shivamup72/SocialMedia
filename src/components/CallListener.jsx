import { useEffect } from 'react';
import { navigationRef } from '../navigation/RootNavigation';
import { useWebRTC } from '../Api/context/WebRTCProvider';

const CallListener = () => {
    const { callState } = useWebRTC();

    useEffect(() => {
        if (callState === 'incoming' && navigationRef.isReady()) {
            navigationRef.navigate('CallScreen');
        }
    }, [callState]);

    return null;
};

export default CallListener;

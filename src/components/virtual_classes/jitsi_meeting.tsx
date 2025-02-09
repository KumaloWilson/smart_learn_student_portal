import React from 'react';
import { JaaSMeeting } from '@jitsi/react-sdk';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { Lecturer } from '../../models/lecturer';

interface JitsiMeetingProps {
    jwt: string;
    roomName: string;
    lecturer: Lecturer;
    onError: (error: Error) => void;
}

export const JitsiMeeting: React.FC<JitsiMeetingProps> = ({
    jwt,
    roomName,
    lecturer,
    onError
}) => {
    // Custom spinner component
    const LoadingSpinner = () => (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        </div>
    );

    return (
        <div className="h-screen">
            <JaaSMeeting
                appId="vpaas-magic-cookie-d4ca65380ed84b6f9ec1d9d3c8bf6f37"
                roomName={roomName}
                jwt={jwt}
                configOverwrite={{
                    startWithAudioMuted: true,
                    startWithVideoMuted: true,
                    disableModeratorIndicator: true,
                    enableClosePage: true,
                    disableProfile: true,
                    enableNoisyMicDetection: true,
                    enableLobby: false, // Disable lobby
                    hideLobbyButton: true,
                    disableRemoteMute: false,
                    remoteVideoMenu: {
                        disableKick: false,
                        disableGrantModerator: true,
                        disablePrivateChat: false
                    }
                }}
                interfaceConfigOverwrite={{
                    TOOLBAR_BUTTONS: [
                        'microphone', 'camera', 'closedcaptions', 'desktop',
                        'fullscreen', 'fodeviceselection', 'hangup', 'profile',
                        'chat', 'recording', 'livestreaming', 'etherpad',
                        'sharedvideo', 'settings', 'raisehand', 'videoquality',
                        'filmstrip', 'shortcuts', 'tileview', 'download', 'help'
                    ],
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    DEFAULT_REMOTE_DISPLAY_NAME: 'Student',
                    TOOLBAR_ALWAYS_VISIBLE: true,
                    DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
                    HIDE_INVITE_MORE_HEADER: false
                }}
                userInfo={{
                    displayName: lecturer.last_name,
                    email: lecturer.email
                }}
                spinner={LoadingSpinner}
                onApiReady={(externalApi) => {
                    // Set up any needed event listeners
                    externalApi.addEventListener('videoConferenceLeft', () => {
                        window.location.href = '/virtual/classes';
                    });
                    externalApi.addEventListener('readyToClose', () => {
                        window.location.href = '/virtual/classes';
                    });
                }}
                getIFrameRef={(iframeRef) => {
                    iframeRef.style.height = '90%';
                    iframeRef.style.width = '100%';
                }}
            />
        </div>
    );
};
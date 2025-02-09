import React from 'react';
import { JaaSMeeting } from '@jitsi/react-sdk';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface StudentMeetingProps {
    jwt: string;
    roomName: string;
    studentName: string;
    studentEmail: string;
    onError: (error: Error) => void;
}

export const StudentMeeting: React.FC<StudentMeetingProps> = ({
    jwt,
    roomName,
    studentName,
    studentEmail,
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
                    disableRemoteMute: true, // Students cannot mute others
                    remoteVideoMenu: {
                        disableKick: true,
                        disableGrantModerator: true,
                        disablePrivateChat: false
                    }
                }}
                interfaceConfigOverwrite={{
                    TOOLBAR_BUTTONS: [
                        'microphone', 'camera', 'chat', 'raisehand', 'tileview', 'fullscreen', 'hangup', 'sharedvideo',
                    ],
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    DEFAULT_REMOTE_DISPLAY_NAME: 'Student',
                    TOOLBAR_ALWAYS_VISIBLE: true,
                    DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
                    HIDE_INVITE_MORE_HEADER: true
                }}
                userInfo={{
                    displayName: studentName,
                    email: studentEmail
                }}
                spinner={LoadingSpinner}
                onApiReady={(externalApi) => {
                    // Handle student leaving the meeting
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

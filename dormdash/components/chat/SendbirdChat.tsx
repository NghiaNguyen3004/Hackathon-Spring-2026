"use client";

import "@sendbird/uikit-react/dist/index.css";
import SendbirdProvider from "@sendbird/uikit-react/SendbirdProvider";
import ChannelList from "@sendbird/uikit-react/ChannelList";
import Channel from "@sendbird/uikit-react/Channel";
import { useState } from "react";

type Props = {
  userId: string;
  nickname: string;
  appId: string;
};

export default function SendbirdChat({ userId, nickname, appId }: Props) {
  const [channelUrl, setChannelUrl] = useState("");

  return (
    <div style={{ height: "80vh", display: "grid", gridTemplateColumns: "320px 1fr" }}>
      <SendbirdProvider
        appId={appId}
        userId={userId}
        nickname={nickname}
      >
        <div style={{ borderRight: "1px solid #e5e7eb" }}>
          <ChannelList
            onChannelSelect={(channel) => {
              if (channel?.url) setChannelUrl(channel.url);
            }}
          />
        </div>

        <div>
          {channelUrl ? (
            <Channel channelUrl={channelUrl} />
          ) : (
            <div style={{ padding: 24 }}>Select a chat</div>
          )}
        </div>
      </SendbirdProvider>
    </div>
  );
}
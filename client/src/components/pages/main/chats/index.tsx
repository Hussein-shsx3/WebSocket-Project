"use client";

import { LogoutButton } from '@/components/ui/buttons/LogoutButton';

const Chats = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Chats Page</h1>
      <div style={{ marginTop: "20px" }}>
        <LogoutButton />
      </div>
    </div>
  );
}

export default Chats;
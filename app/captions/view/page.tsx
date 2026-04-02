import CaptionsViewerClient from './CaptionsViewerClient';

type PageProps = {
  searchParams?: {
    roomCode?: string;
  };
};

export default function CaptionsViewerPage({ searchParams }: PageProps) {
  const roomCode = (searchParams?.roomCode || '').trim().toLowerCase();
  return <CaptionsViewerClient initialRoomCode={roomCode} />;
}


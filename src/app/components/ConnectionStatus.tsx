import { useChatConnection, useOccupancy } from "@ably/chat/react";

export default function ConnectionStatus() {
  // Hook to get the current connection status
  const { currentStatus } = useChatConnection();

    const { connections } = useOccupancy({
      listener: (occupancyEvent) => {
        console.log('Number of users connected is: ', occupancyEvent.occupancy.connections);
      },
    });
  return (
    <div className="p-4 text-center h-full border-gray-300 bg-gray-100">
      <h2 className="text-lg font-semibold text-blue-500">Ably Chat Connection</h2>
      <p className="mt-2">Connection: {currentStatus}!</p>
      <p>{connections}</p>
    </div>
  );
}

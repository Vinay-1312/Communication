using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Threading.Tasks;

namespace ChatAppServer.Hubs
{
    public class ChatHub : Hub
    {
        // Thread-safe dictionary to map a user's "username" to their current connection ID
        private static ConcurrentDictionary<string, string> _userConnections 
            = new ConcurrentDictionary<string, string>();

        // Called automatically when a new client connects
        public override async Task OnConnectedAsync()
        {
            // Retrieve the "userName" from the query string (NOT secure, just for demo)
            var userName = Context.GetHttpContext()?.Request.Query["userName"].ToString();

            if (!string.IsNullOrEmpty(userName))
            {
                // Store or update the mapping of userName -> connectionId
                _userConnections[userName] = Context.ConnectionId;
                Console.WriteLine(userName);
            }

            await base.OnConnectedAsync();
        }

        // Called automatically when the client disconnects
        public override async Task OnDisconnectedAsync(System.Exception? exception)
        {
            var userName = Context.GetHttpContext()?.Request.Query["userName"].ToString();

            if (!string.IsNullOrEmpty(userName))
            {
                // Remove the user from the dictionary
                _userConnections.TryRemove(userName, out _);
            }

            await base.OnDisconnectedAsync(exception);
        }

        // Method for sending a private message to a specific user (by userName)
        public async Task SendPrivateMessage(string targetUserName, string fromUser,string message)
        {
            // Check if the target user is connected
            if (_userConnections.TryGetValue(targetUserName, out var connectionId))
            {
                // Send the message only to that client's connection
                // Also pass the sender's connection ID (or you could pass the sender’s userName if stored)
                await Clients.Client(connectionId).SendAsync("ReceivePrivateMessage",
                    fromUser, 
                    message
                );
            }
            else
            {
                // Optionally handle the case where the user is not connected
                // e.g., store message in a DB or notify the sender
            }
        }
    }
}

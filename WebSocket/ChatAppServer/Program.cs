using ChatAppServer.Hubs;

var builder = WebApplication.CreateBuilder(args);

// 1) Add services to the container
builder.Services.AddSignalR();

// If your React app is running on a different port/origin (e.g. localhost:3000),
// enable Cross-Origin Requests
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", builder =>
    {
        builder
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .SetIsOriginAllowed((host) => true); // Allows any origin
    });
});

var app = builder.Build();

// 2) If in development, use the Developer Exception Page
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

// 3) Configure middleware
app.UseRouting();
app.UseCors("CorsPolicy");

// 4) Map our SignalR hub endpoint
app.MapHub<ChatHub>("/chathub");

// 5) Run the app
app.Run();

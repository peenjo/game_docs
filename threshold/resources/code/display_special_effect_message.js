const message = scope.message;
const onlyToGMs = scope.onlyToGMs || false;
let title = scope.title || "Special Effect";

const params = {
    content: `<div class="twodsix-chat-card"> <p>${message}</p> </div>`,
    speaker: {alias: title},
}

if (onlyToGMs) {
    params.whisper = game.users.filter(u => u.isGM).map(u => u._id);
}

// post the chat message object in Foundry
await ChatMessage.create(params);

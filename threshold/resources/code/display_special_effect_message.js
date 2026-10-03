const message = scope.message;
const whisper = scope.whisper || [];

let chatContent = `<div class="twodsix-chat-card"> <p>${message}</p> </div>`;

// post the chat message object in Foundry
await ChatMessage.create({
    content: chatContent,
    speaker: {alias: "Special Effect"},
    whisper: whisper,
});

const constants = {
    STATUS_CONTENT: "modmail | DM to contact staff"
}

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        client.user.setActivity(constants.STATUS_CONTENT, { type: 'PLAYING' });

        console.log("Bot up and running!");
    },
};
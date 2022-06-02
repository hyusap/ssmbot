const constants = {
    STATUS_CONTENT: "over your modmail"
}

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        client.user.setActivity({ name: constants.STATUS_CONTENT, type: 'WATCHING' });

        console.log("Bot up and running!");
    },
};
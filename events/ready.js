module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		client.user.setActivity({ name: process.env.STATUS, type: 'PLAYING' });

		console.log("I am groot.");
	},
};
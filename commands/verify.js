const { SlashCommandBuilder } = require("@discordjs/builders");
const nodemailer = require("nodemailer");
const { createHash } = require("crypto");
const { CommandInteractionOptionResolver } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Get access to the server")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("email")
        .setDescription(
          "Provide your email address to get access to the verification code"
        )
        .addStringOption((option) =>
          option
            .setName("email")
            .setDescription("Please send your NCSSM email here")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("code")
        .setDescription("Provide the code to verify your account")
        .addStringOption((option) =>
          option
            .setName("code")
            .setDescription("Please put the code here")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    if (interaction.options.getSubcommand() === "email") {
      const email = interaction.options.getString("email");
      const emailRegex = /[A-Za-z]+(22|23|24)[A-Za-z]+@ncssm\.edu/;
      if (emailRegex.test(email)) {
        await interaction.deferReply();

        const salt = process.env.SALT || "salt";
        const hash = createHash("sha256")
          .update(interaction.user.tag + salt)
          .digest("hex")
          .slice(-10);
        console.log(hash);

        let testAccount = await nodemailer.createTestAccount();
        let transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
          },
        });

        let info = await transporter.sendMail({
          from: '"NCSSM" <ncssm@test.com>',
          to: email,
          subject: "Verification Email",
          text:
            "Welcome to the NCSSM Discord Server! Here is your verification code: " +
            hash,
        });

        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        interaction.followUp(
          `Please check your email for a verification link. ${nodemailer.getTestMessageUrl(
            info
          )}`
        );
      } else {
        await interaction.reply("This email is not vaild, please try again.");
      }
    } else if (interaction.options.getSubcommand() === "code") {
      const code = interaction.options.getString("code");
      const salt = process.env.SALT || "salt";
      const hash = createHash("sha256")
        .update(interaction.user.tag + salt)
        .digest("hex")
        .slice(-10);
      if (code === hash) {
        await interaction.reply("You are verified!");
      } else {
        await interaction.reply("This code is incorrect, please try again.");
      }
    }
  },
};

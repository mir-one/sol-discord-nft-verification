import DiscordJS, { Intents, MessageActionRow, MessageButton, UserManager } from 'discord.js';
import dotenv from 'dotenv';
import uniqueString from 'unique-string';
import bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';
import fs from 'fs';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());
dotenv.config();

const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});

var thisGuild;

app.post('/', async (req, res) => {
    const body = req.body;
    const id = req?.body?.id;
    const image = req?.body?.image;
    const name = req?.body?.name;

    if(body?.verified){
        AssignRole(id,image,name);
        const manager = new UserManager(client);
        const currentUser = await manager.fetch(id);
        
        thisGuild.channels.cache.find(ch => ch.name === process.env.CHANNEL_NAME).send({
            content: currentUser.tag + " has been verified with NFT: " + name,
            embeds: [
              {
                thumbnail: {
                  url: image
                }
              }
            ],
          })
            .catch(console.error);
        
        res.send("Success!");
    } else{
        res.send("Verification Failed!")
    }
    
  });

  const port = process.env.PORT || 9090;
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  });

function AssignRole(id, url,name){
    const myRole = thisGuild.roles.cache.find(role => role.name === name);
    if(myRole){
        thisGuild.members.cache.get(id).roles.add(myRole);
    }
    else{
        thisGuild.roles.create({
            name: name,
            color: 'RED',
            reason: 'User is verified!',
            hoist:true
          })
            .then( () => {     
                 const myRole = thisGuild.roles.cache.find(role => role.name===name);  
                 thisGuild.members.cache.get(id).roles.add(myRole);}
            )
            .catch(console.error);
    }
        //If you have a boosted server with enough levels you can set your role icon with the NFT. If this doesn't work you may need to download and convert the image of NFT to base64 string.
        // myRole.setIcon(url);
}

const row = new MessageActionRow()
    .addComponents(
        new MessageButton()
           .setCustomId('verifyButton')
           .setEmoji('✔')
           .setLabel('Start Verification')
           .setStyle('SUCCESS')
    )


client.on('ready', () => {
    console.log('The bot is ready!');

});

client.on('messageCreate', (message) => {
    const thisGuild = client.guilds.cache.get(message.guild.id);
    if(message.member?.id === thisGuild?.ownerId && message.content=== '!verifyNFT'){
        message.channel.send({
            content: "Here you can verify your NFT to grant access.",
            components: [row],
        });
    }
});


client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton() && interaction.customId ==='verifyButton') {
        thisGuild=client.guilds.cache.get(interaction.guild.id);
        const uniqueStr = uniqueString();
        const linkRow = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setURL(process.env.APP_URL + uniqueStr + "/" + interaction.user.id)
                .setLabel('Verify your NFT')
                .setStyle('LINK')
            )

        interaction.reply({
            content: 'Use this link to connect',
            components: [linkRow],
            ephemeral:true
        });     
    }
});


client.login(process.env.TOKEN);
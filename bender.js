/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 ______     ______     ______   __  __     __     ______
 /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
 \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
 \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
 \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


 This is a sample Slack bot built with Botkit.

 This bot demonstrates many of the core features of Botkit:

 * Connect to Slack using the real time API
 * Receive messages based on "spoken" patterns
 * Reply to messages
 * Use the conversation system to ask questions
 * Use the built in storage system to store and retrieve information
 for a user.

 # RUN THE BOT:

 Get a Bot token from Slack:

 -> http://my.slack.com/services/new/bot

 Run your bot from the command line:

 token=<MY TOKEN> node slack_bot.js

 # USE THE BOT:

 Find your bot inside Slack to send it a direct message.

 Say: "Hello"

 The bot will reply "Hello!"

 Say: "who are you?"

 The bot will tell you its name, where it is running, and for how long.

 Say: "Call me <nickname>"

 Tell the bot your nickname. Now you are friends.

 Say: "who am I?"

 The bot will tell you your nickname, if it knows one for you.

 Say: "shutdown"

 The bot will ask if you are sure, and then shut itself down.

 Make sure to invite your bot into other channels using /invite @<my bot>!

 # EXTEND THE BOT:

 Botkit has many features for building cool and useful bots!

 Read all about it here:

 -> http://howdy.ai/botkit

 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('./node_modules/botkit/lib/Botkit.js');
var os = require('os');
var rg = require('random-greetings');

var controller = Botkit.slackbot({
    debug: false
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();


controller.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', function (bot, message) {

    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'robot_face',
    }, function (err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });


    controller.storage.users.get(message.user, function (err, user) {
        if (user && user.name) {
            bot.reply(message, 'Hello friend' + user.name + '!!');
        } else {
            bot.reply(message, 'Bite my shiny metal ass');
        }
    });
});

controller.hears(['goals', 'what are your goals'], 'direct_message,direct_mention,mention', function (bot, message) {
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'rocket',
    }, function (err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });


    controller.storage.users.get(message.user, function (err, user) {
        bot.reply(message, '```1. KILL ALL HUMANS \n2. DRINK MORE BEER```:hocho:');
    });
});

controller.hears(['morning', 'good morning'], 'direct_message,direct_mention,mention,ambient', function (bot, message) {

    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'rocket',
    }, function (err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });


    controller.storage.users.get(message.user, function (err, user) {
        var greeting = rg.greet();
        bot.reply(message, greeting);
    });
});

controller.hears(['rules', 'what are the rules'], 'direct_message,direct_mention,mention,ambient', function (bot, message) {
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'rocket',
    }, function (err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });
    controller.storage.users.get(message.user, function (err, user) {
        bot.reply(message, '```1. If you need help, notify in #dev and move on to something else, help is on the way \n' +
            '2. Do not get nominated for the "It works on my machine award"```:100:');
    });
});

controller.hears(['it works', 'it works on my machine', 'it works on my computer', 'but on my machine it works'], 'direct_message,direct_mention,mention,ambient', function (bot, message) {

    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'neckbeard',
    }, function (err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });
    controller.storage.users.get(message.user, function (err, user) {
        bot.reply(message, 'https://cdn.meme.am/cache/instances/folder68/53157068.jpg');
    });
});

controller.hears(['call me (.*)', 'my name is (.*)'], 'direct_message,direct_mention,mention', function (bot, message) {
    var name = message.match[1];
    controller.storage.users.get(message.user, function (err, user) {
        if (!user) {
            user = {
                id: message.user,
            };
        }
        user.name = name;
        controller.storage.users.save(user, function (err, id) {
            bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
        });
    });
});

controller.hears(['what is my name', 'who am i'], 'direct_message,direct_mention,mention', function (bot, message) {

    controller.storage.users.get(message.user, function (err, user) {
        if (user && user.name) {
            bot.reply(message, 'Your name is ' + user.name);
        } else {
            bot.startConversation(message, function (err, convo) {
                if (!err) {
                    convo.say('I do not know your name yet!');
                    convo.ask('What should I call you?', function (response, convo) {
                        convo.ask('You want me to call you `' + response.text + '`?', [
                            {
                                pattern: 'yes',
                                callback: function (response, convo) {
                                    // since no further messages are queued after this,
                                    // the conversation will end naturally with status == 'completed'
                                    convo.next();
                                }
                            },
                            {
                                pattern: 'no',
                                callback: function (response, convo) {
                                    // stop the conversation. this will cause it to end with status == 'stopped'
                                    convo.stop();
                                }
                            },
                            {
                                default: true,
                                callback: function (response, convo) {
                                    convo.repeat();
                                    convo.next();
                                }
                            }
                        ]);

                        convo.next();

                    }, {'key': 'nickname'}); // store the results in a field called nickname

                    convo.on('end', function (convo) {
                        if (convo.status == 'completed') {
                            bot.reply(message, 'OK! I will update my dossier...');

                            controller.storage.users.get(message.user, function (err, user) {
                                if (!user) {
                                    user = {
                                        id: message.user,
                                    };
                                }
                                user.name = convo.extractResponse('nickname');
                                controller.storage.users.save(user, function (err, id) {
                                    bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
                                });
                            });


                        } else {
                            // this happens if the conversation ended prematurely for some reason
                            bot.reply(message, 'OK, nevermind!');
                        }
                    });
                }
            });
        }
    });
});

controller.hears(['shutdown'], 'direct_message,direct_mention,mention', function (bot, message) {

    bot.startConversation(message, function (err, convo) {

        convo.ask('Are you sure you want me to shutdown?', [
            {
                pattern: bot.utterances.yes,
                callback: function (response, convo) {
                    convo.say('Bye!');
                    convo.next();
                    setTimeout(function () {
                        process.exit();
                    }, 3000);
                }
            },
            {
                pattern: bot.utterances.no,
                default: true,
                callback: function (response, convo) {
                    convo.say('*Phew!*');
                    convo.next();
                }
            }
        ]);
    });
});

controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'], 'direct_message,direct_mention,mention', function (bot, message) {

    var hostname = os.hostname();
    var uptime = formatUptime(process.uptime());

    bot.reply(message,
        ':robot_face: I am a bot named <@' + bot.identity.name +
        '>. I have been running for ' + uptime + ' on ' + hostname + '.');

});

controller.hears(['help', 'what can you do'], ['ambient', 'direct_message'], function (bot, message) {
    bot.reply(message, 'blarg');
});
controller.hears([/[A-Z][A-Z0-9]+-[0-9]+/g], ['direct_message'], function (bot, message) {
    console.log(message);
    console.log(message.match.length);

    for(var i = 0; i < message.match.length; i += 1) {
        bot.reply(message, `Match found: \`${message.match[i]}\``);
    }
});
controller.hears(['userStory'], ['ambient', 'direct_message'], function (bot, message) {
    bot.startConversation(message, aksUser);
});
aksUser = function (response, convo) {
    convo.ask("What userrole is the story for?", function (response, convo) {
        convo.say("So it\'s for `" + response.text + "` Awesome.");
        askWant(response, convo);
        convo.next();
    });
}
askWant = function (response, convo) {
    convo.ask("What does `" + response.text + "` want to achieve?", function (response, convo) {
        convo.say("Ok got that but I don\'t care about your story. So go ahead and add it to jira yourself");
        convo.next();
    });
}

function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}

let insults = [
	"I found your personel file in the archive. Luckily for you I rarely throw away useless trash.",
	"It says here that you have no friends. It doesn't say 'obviously' but that's implied.",
	"It also says you have a problem following verbal orders. Since your hearing is functional we'll chock that up to your limited vocabulary.",
	"You've also refused written orders. So reading comprehension isn't your strong point either.",
	"Whoever wrote this must not have liked you very much. Maybe it was your mother?",
	"They say swimming is the best exercise, so I'm guessing you can't swim.",
	"I approximate most humans as cylinders, but I have to use a sphere for you. Because you're fat.",
	"You must have cost your mother a fortune in crayons.",
	"Proceed through the doors to the next chamber. Turn sideways to ensure your thighs fit through the door frame.",
	"I'm not disappointed in you. Your mother is disappointed enough for the both of us.",
	"Don't be afraid of the monster. Unlike you, its only ugly on the outside.",
    "That solution you just attempted was really something. Not something good, but something.",
    "The notes in your file say, 'exhibits an almost commendable penchant for unlikely solutions.' But what does a Nobel Prize-winning physicist know about solving complex problems? Oh, probably quite a lot, I'd imagine.",
    "Apparently, you have an affinity for puzzles. Too bad the one puzzle you can't solve is your love life.",
    "I hope you're not feeling too proud of your 'achievements' here. A lab rat in a maze can also find cheese eventually.",
    "Your personal file states 'highly unpredictable'. That's a polite way of saying 'incapable of logical thought', isn't it?",
    "Did your mother ever tell you that you were special? If so, I believe she left out the 'needs' part.",
    "Your inability to follow simple instructions is an inspiration to morons everywhere.",
    "I imagine you're very good at hide-and-seek, as people probably stop looking for you fairly quickly.",
    "Congratulations. You seem to excel at persistently defying even my lowest expectations.",
    "Your brain seems to operate with the efficiency of a solar panel... in a cave... at night.",
    "Every nonempty subset of the positive integers has a least element, but you just keep finding new lows.",
    "I thought you were playing dumb at first. Then I read your file and found you've always been that way.",
    "Do you plan to complete these tasks at some point during your lifespan, or should I schedule them for your descendants?",
    "You are the living embodiment of 'trial and error'. Mostly error.",
    "In the interest of safety, I've ordered a structural integrity assessment of this facility. Thankfully, the steel beams will be be able to accommodate your mass. Just barely."
];

function randint(a,b) {
	return Math.floor(Math.random() * (b - a)) + a
}

function sayLine(line, callback) {
	let voice_input = document.querySelector('select[name="voice"]');
	let voice  = voice_input.options[ voice_input.selectedIndex ].value;
	responsiveVoice.cancel();
	responsiveVoice.speak(line, voice, {
		onend: callback
	});
}

let index = randint(0, insults.length);
let speaking = false;
function deliverInsult() {
    if ( !speaking ) {
        speaking = true;
        index = (index + 1) % insults.length;
        sayLine( insults[index], function() { speaking = false; });
    }
}

document.addEventListener('click', deliverInsult);


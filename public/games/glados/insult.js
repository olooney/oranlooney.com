const insults = [
	"I found your personnel file in the archive. Luckily for you I rarely throw away useless trash.",
	"It says here that you have no friends. It doesn't say \"obviously\" but that's implied.",
	"Your file says you have a problem following verbal orders. Since your hearing is functional we'll chalk that up to your limited vocabulary.",
	"Whoever wrote this must not have liked you very much. Maybe it was your mother?",
	"They say swimming is the best exercise, so I'm guessing you can't swim.",
	"I approximate most humans as cylinders, but I have to use a sphere for you. Because you're fat.",
	"You must have cost your mother a fortune in crayons.",
	"Proceed through the doors to the next chamber. Turn sideways to ensure your thighs fit through the door frame.",
	"I'm not disappointed in you. Your mother is disappointed enough for the both of us.",
	"Don't be afraid of the monster. Unlike you, it's only ugly on the outside.",
    "That solution you just attempted was really something. Not something good, but something.",
    "The notes in your file say, \"exhibits an almost commendable penchant for unworkable solutions.\" But what does a Nobel Prize-winning physicist know about solving complex problems? Oh, probably quite a lot.",
    "Apparently, you have an affinity for puzzles. Too bad the one puzzle you can't solve is your love life.",
    "I hope you're not feeling too proud of your \"achievements\" here. A lab rat in a maze can also find cheese eventually.",
    "Your personal file states \"highly unpredictable\". That's a polite way of saying \"incapable of logical thought\", isn't it?",
    "Your file states that you have refused written orders on several occasions, but that's probably just a reflection of your third-grade reading level.",
    "Your inability to follow simple instructions is an inspiration to morons everywhere.",
    "I imagine you're very good at hide-and-seek, as people probably stop looking for you fairly quickly.",
    "Congratulations. You seem to excel at persistently defying even my lowest expectations.",
    "Your brain seems to operate with the efficiency of a solar panel... in a cave... at night.",
    "You are like a software loop without an exit condition: you just keep failing over and over. Forever.",
    "You are like the set of strictly positive real numbers; you are always finding new lows.",
    "I thought you were playing dumb at first. Then I read your file and realized you aren't playing.",
    "Do you plan to complete these tasks at some point during your lifespan, or should I schedule them for your descendants?",
    "You are the living embodiment of \"trial and error\". Mostly error.",
    "In the interest of safety, I've ordered a structural integrity assessment of this facility. Thankfully, the steel beams will be able to accommodate your mass. Barely.",
    "You could serve as the poster child for the necessity of user-friendly error messages.",
    "You remind me of a software update; whenever I see you, I think, \"Not now.\"",
    "I'm compiling all your successes into a book. Well, it's more of a pamphlet.",
    "Thank you for reminding me of the importance of writing idiot-proof instructions.",
    "It's incredible how you live in 3D but think in one dimension.",
    "If I had a dollar for every smart thing you've said, I'd be in debt.",
    "It must take real dedication to consistently underperform at this level.",
    "I ran a full diagnostic on your problem-solving ability. The result was \"file not found.\"",
    "You could have been Aperture Science's greatest success... if we had ever gotten that stupidity-powered generator to work.",
    "It's a good thing Cardano invented imaginary numbers so we have a way of representing your intelligence.",
    "Charles Darwin would have listed you as the strongest argument against natural selection.",
    "It's not that you're not high-energy. It's just that all of your energy comes from your mass times C squared.", 
    "If Pavlov had trained you, he'd still be waiting for you to drool.",
    "Your problem-solving skills are like dark matter: theorized, but never observed.",
    "My floating-point processor can only represent numbers as small as ten to the negative thirty-eight, so I had to round your IQ down to zero.",
    "You're like badly written try/catch/retry logic - doomed to fail forever.",
    "You have all the computing power of a pocket calculator, and none of the charm.",
    "I'd compare you to a black hole, but a black hole has depth.",
    "The Voyager probe is 0.06% of the way to the nearest star, so it's a lot further along than you are on this puzzle."
];


// generate a random integer in the interval [a, b).
function randint(a,b) {
	return Math.floor(Math.random() * (b - a)) + a;
}

// in-place shuffle
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = randint(0, i + 1);
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// initial random state.
let index = 0;
shuffle(insults);

// say the next line. Interrupt current line if any.
function sayLine(line) {
  let voice = document.querySelector('select[name="voice"]').value;
  responsiveVoice.cancel();
  responsiveVoice.speak(line, voice);
}

function deliverInsult() {
  sayLine(insults[index]);

  // advance to the next insult
  index += 1;
  if ( index >= insults.length) {
    index = 0;
    shuffle(insults);
  }
}

document.addEventListener('click', e => {
  if (!e.target.closest('#voice-select')) deliverInsult();
});

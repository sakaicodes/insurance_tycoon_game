/* data/events.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
/* Events */
const EVENTS = [
  {id:"hail", title:"Hail the size of grapes", text:"A freak storm just dented every car in town. The phones are ringing.", choices:[
    {label:() => `Pay everyone fast (${fmt(B()*2)})`, run(){ spend(B()*2,"paid"); mood(10); return "Customers are stunned. One sent a fruit basket. The fruit was also dented."; }},
    {label:() => "Call it an “act of God”", run(){ mood(-10); if (Math.random() < .4){ spend(B(),"other"); return `God was unavailable for comment. The regulator was not. Fine: ${fmt(B())}.`; } return "Technically true. Customers are not amused."; }}]},
  {id:"consultant", title:"A consultant in a vest", text:"He offers to rename “claims” to “Customer Outcome Moments.” He says “journey” six times in one sentence.", choices:[
    {label:() => `Hire him (${fmt(B())})`, run(){ spend(B(),"other"); S.stock *= 1.03; return "Nothing changed. The share price rose 3% anyway. Analysts love a journey."; }},
    {label:() => "Show him the door", run(){ return "He calls the door an “exit opportunity” and leaves."; }}]},
  {id:"viral", title:"Percy went viral", text:"A video of your mascot doing the worm at a funeral has 40 million views.", choices:[
    {label:() => "Lean in", run(){ S.buffs.sales = 30; mood(-3); return "Sales doubled for 30 seconds. The family has not commented."; }},
    {label:() => "Issue a heartfelt apology", run(){ mood(5); return "Percy’s apology video also went viral. Customers feel a bit better about you."; }}]},
  {id:"sourdough", title:"An unusual request", text:"A man wants to insure his sourdough starter. Her name is Doughlores. She is 11 years old.", choices:[
    {label:() => `Write the policy (+${fmt(B()*0.8)})`, run(){ gain(B()*0.8); if (Math.random() < .35) addClaim("Gerald","Doughlores has passed. He claims she was “murdered by a dishwasher.”", B()*2); return "Premium collected. Doughlores is now a policyholder."; }},
    {label:() => "Politely decline", run(){ return "He says Doughlores will remember this. She is yeast."; }}]},
  {id:"regulator", title:"The regulator is here", text:() => S.happy < 40 ? "They’ve been reading your reviews. They brought a clipboard." : "Just a routine visit. They brought a clipboard anyway.", choices:[
    {label:() => "Offer them pastries", run(){ if (S.happy < 40){ const f = B()*1.5; spend(f,"other"); return `The pastries were noted as “a lot.” Fine: ${fmt(f)}.`; } return "They took two croissants and left happy."; }},
    {label:() => "Show them the fine print", run(){ if (lv("legal") >= 2) return "They needed a microscope. They gave up. You’re in the clear."; const f = B(); spend(f,"other"); return `They could read it. That was the problem. Fine: ${fmt(f)}. (A bigger Legal team would help.)`; }}]},
  {id:"printer", title:"The printer has demands", text:"The office printer has become self-aware. It wants dental coverage and to never print in color again.", choices:[
    {label:() => `Give it dental (${fmt(B()*0.5)})`, run(){ spend(B()*0.5,"other"); S.buffs.morale = 40; return "Morale soared. Everyone works faster for a while."; }},
    {label:() => "Unplug it", run(){ return "It printed one final page that just said “why.” Nobody talks about it."; }}]},
  {id:"ai", title:"An analyst asks about AI", text:"“What’s your AI strategy?” You sell insurance out of a building with a goat problem.", choices:[
    {label:() => "Say “AI” forty times on the next call", run(){ S.aiHype = true; return "The City will hear about it at the next earnings call."; }},
    {label:() => "Explain the actual business", run(){ S.stock *= 0.98; return "They fell asleep. Share price dipped 2%."; }}]},
  {id:"forecast", title:"Forecast: unusually exciting", text:"The weather channel used the phrase “bring snacks.” Expect a lot of claims soon.", choices:[
    {label:() => "Brace for it", run(){ S.buffs.surge = 30; return "Claims will pour in for the next 30 seconds. Smaller ones, at least."; }},
    {label:() => `Quietly raise prices (+${fmt(B()*0.6)})`, run(){ S.buffs.surge = 30; gain(B()*0.6); mood(-6); return "Extra cash now, crankier customers later. The claims are still coming."; }}]},
  {id:"mustache", title:"A mustache, insured", text:"A famous yodeler wants to insure his mustache for one million pounds.", choices:[
    {label:() => `Insure it (+${fmt(B()*1.2)})`, run(){ gain(B()*1.2); if (Math.random() < .3) addClaim("Lorenz the Yodeler","Mustache caught in a cheese grater during a very high note.", B()*4); return "The mustache is now a valued customer."; }},
    {label:() => "Pass", run(){ return "He yodels sadly on his way out. It’s beautiful, honestly."; }}]},
  {id:"kevin", title:"Kevin found something", text:"Kevin from accounting found an envelope of cash labeled “do not find.”", choices:[
    {label:() => `Keep it (+${fmt(B()*0.9)})`, run(){ gain(B()*0.9); return "Kevin is employee of the month. He got a mug."; }},
    {label:() => "Throw a staff party with it", run(){ S.buffs.morale = 45; mood(2); return "Great party. Someone photocopied their face. Everyone works faster for a while."; }}]},
  {id:"letter", title:"A letter from a shareholder", text:"“Dear CEO, why aren’t profits infinite yet? Sincerely, a pension fund.”", choices:[
    {label:() => `Buy back shares (${fmt(buybackCost())})`, run(){ if (!doBuyback()) return "You couldn’t afford it, so you sent a nice card instead."; return "Share price up 4%. They’re calmer now. The building is exactly the same."; }},
    {label:() => "Reply with a thumbs-up emoji", run(){ S.stock *= 0.99; return "Received poorly. Share price down 1%."; }}]},
  {id:"review", title:"A glowing review", text:"“They paid my claim. In full. On time. I’m frightened.”", cond:() => S.happy > 60, choices:[
    {label:() => "Frame it in the lobby", run(){ mood(6); return "Customers are cautiously optimistic. Sales should tick up."; }},
    {label:() => "Find out who approved that", run(){ mood(-2); return "It was the Claims Office. They’ve been reminded about “balance.”"; }}]},
  {id:"goat", title:"A goat in the lobby", text:"A goat wandered in. Nobody knows whose it is. It is eating the brochures.", choices:[
    {label:() => "Make it a second mascot", run(){ S.buffs.sales = 20; return "Percy is furious. Sales doubled for 20 seconds."; }},
    {label:() => `Sell the goat a policy (+${fmt(B()*0.4)})`, run(){ gain(B()*0.4); return "The goat signed with its hoof. Then ate the pen."; }}]},
  {id:"offsite", title:"Leadership offsite", text:"Your executives want a three-day retreat to “realign on alignment.”", choices:[
    {label:() => `Approve it (${fmt(B()*0.7)})`, run(){ spend(B()*0.7,"other"); S.buffs.morale = 35; S.stock *= 1.01; return "They came back with a new slogan and better posture. Staff work faster for a while."; }},
    {label:() => "Send a calendar invite instead", run(){ return "They realigned in a 30-minute call. Nobody turned on their camera."; }}]},
  {id:"rebrand", title:"The board wants a rebrand", text:"The agency’s big idea: same umbrella, same holes, but now the holes are “intentional.”", choices:[
    {label:() => `Approve it (${fmt(B())})`, run(){ spend(B(),"other"); S.stock *= 1.02; mood(2); return "The new logo is identical. Share price up 2%. Customers say it feels “fresher.”"; }},
    {label:() => "Keep the old holes", run(){ return "The agency calls you “brave” in a tone that means the opposite."; }}]},
  {id:"influencer", title:"An influencer slides into your DMs", text:"She has 2 million followers and wants free coverage for her “content house” in exchange for posts.", choices:[
    {label:() => `Deal (${fmt(B()*0.3)})`, run(){ spend(B()*0.3,"other"); S.buffs.sales = 25; return "Her post said “not sponsored” and “#ad” at the same time. Sales doubled for 25 seconds."; }},
    {label:() => "Politely say no", run(){ mood(-1); return "She posted a video called “Why I’m leaving insurance.” She was never in insurance."; }}]},
  {id:"crypto", title:"The intern has an idea", text:"He wants to put the rainy-day fund into a new coin called DeductibleCoin.", choices:[
    {label:() => `Invest ${fmt(B()*1.5)}`, run(){ const a = B()*1.5; if (Math.random() < .5){ gain(a); return `It doubled! You sold at the top and made ${fmt(a)}. The intern is unbearable now.`; } spend(a,"other"); return "DeductibleCoin is now worth one (1) actual deductible. The money is gone."; }},
    {label:() => "Absolutely not", run(){ return "He invested his own savings instead. He now owns a jet ski and a lawyer."; }}]},
  {id:"flood", title:"The river is rising", text:"Heavy rain upstream. Homes along the river are taking on water, and nobody read the part about floods.", choices:[
    {label:() => `Pay out anyway (${fmt(B()*1.5)})`, run(){ spend(B()*1.5,"paid"); mood(8); return "Customers are amazed. A local news anchor cried on air."; }},
    {label:() => "Point out floods aren’t covered", run(){ mood(-12); if (Math.random() < .5){ sue(B()*2); return "Correct, legally. A class action is now being organized in a church basement."; } return "Correct, legally. Customers are furious, but nobody has sued. Yet."; }}]},
  {id:"golf", title:"Golf with the analysts", text:"The analysts who rate your stock invited you on a golf weekend. You don’t play golf.", choices:[
    {label:() => `Go anyway (${fmt(B()*0.4)})`, run(){ spend(B()*0.4,"other"); S.stock *= 1.03; return "You lost every hole, laughed at every joke, and the share price rose 3%."; }},
    {label:() => "Stay and work", run(){ S.stock *= 0.99; return "Analysts found your work ethic “unsettling.” Share price down 1%."; }}]},
  {id:"award", title:"You won an award", text:() => `${coName()} was named “Most Improved Hold Music” at the regional insurance gala.`, choices:[
    {label:() => "Accept it on stage", run(){ mood(3); S.stock *= 1.01; return "Your speech ran eleven minutes and included a hold music medley. People loved it, somehow."; }},
    {label:() => "Send Percy to accept", run(){ S.buffs.sales = 15; return "Percy did the worm again. It went viral again. Sales doubled briefly."; }}]},
  {id:"hybrid", title:"Staff want to work from home", text:"A petition is going around. It has 300 signatures and one paw print.", choices:[
    {label:() => "Let them", run(){ S.buffs.morale = 45; return "Productivity went up. Nobody can explain it. Everyone works faster for a while."; }},
    {label:() => "Everyone back in the office", run(){ S.stock *= 1.01; mood(-1); return "Analysts love a full office. Share price up 1%. The coffee machine is overwhelmed."; }}]},
  {id:"chatbot", title:"Launch a claims chatbot?", text:"IT built a chatbot that answers claims in under a second. It answers all of them the same way.", choices:[
    {label:() => "Launch it and tell The City", run(){ S.aiHype = true; mood(-5); return "It denied a claim from its own developer. Customers are annoyed, but analysts will hear about it on the next call."; }},
    {label:() => "Keep humans on the phones", run(){ mood(2); return "Customers appreciate talking to a person. The person is Doug. Doug is doing his best."; }}]},
  {id:"quake", title:"A small earthquake", text:"Nothing major, but every bookshelf in town just fell over. Claims incoming.", choices:[
    {label:() => `Send help vans (${fmt(B())})`, run(){ spend(B(),"other"); mood(10); S.buffs.surge = 25; return "Your vans were first on the scene. Claims are coming, but customers love you."; }},
    {label:() => "Post “thoughts and prayers”", run(){ mood(-4); S.buffs.surge = 25; return "The post got 14 likes, mostly from bots. Claims are coming."; }}]},
  {id:"ransom", title:"Hackers locked the computers", text:"Every screen shows a skull and a request for money. The cat modellers are weeping.", choices:[
    {label:() => `Pay the ransom (${fmt(B()*1.2)})`, run(){ spend(B()*1.2,"other"); return "Files unlocked. The hackers left you a five-star review."; }},
    {label:() => "Refuse to pay", run(){ if (Math.random() < .5){ const a = B()*2; spend(a,"other"); return `Restoring everything took a week and cost ${fmt(a)}.`; } return "Kevin found a full backup on a USB stick labeled “taxes 2004.” Crisis over."; }}]},
  {id:"legs", title:"A pop star’s legs", text:"A pop star wants to insure her legs before a world tour that involves a lot of stairs.", choices:[
    {label:() => `Insure them (+${fmt(B()*1.5)})`, run(){ gain(B()*1.5); if (Math.random() < .3) addClaim("A Pop Star","Tripped over a fog machine during the encore. Both legs. Very dramatic.", B()*4); return "Premium collected. Her fans now follow your company account."; }},
    {label:() => "Too risky", run(){ return "She wrote a breakup song about you. It’s number one."; }}]},
  {id:"dogs", title:"Bring your dog to work?", text:"Someone already brought their dog. It’s sitting at a desk. It looks competent.", choices:[
    {label:() => "Dogs are welcome", run(){ S.buffs.morale = 50; return "Morale is through the roof. One dog was promoted to team lead."; }},
    {label:() => "No dogs", run(){ return "The dog was escorted out. It left a cover letter."; }}]},
  {id:"merger", title:"A rival wants to merge", text:"Slightly Less Fine Print Inc. proposes a merger. Their CEO uses “synergy” like punctuation.", choices:[
    {label:() => `Merge (${fmt(B()*2)})`, run(){ spend(B()*2,"other"); S.stock *= 1.08; mood(-5); return "Share price up 8%. Customers now have two hold lines that connect to each other."; }},
    {label:() => "Decline", run(){ return "Their CEO says “let’s circle back.” He will not circle back."; }}]},
  {id:"audit", title:"The auditors are here", text:"They found a spreadsheet named “final_FINAL_v7_REAL_use this one.xlsx.”", choices:[
    {label:() => "Have the actuaries explain it", run(){ if (lv("actuary") >= 2){ S.stock *= 1.02; return "The actuaries explained it for four hours. The auditors left impressed and slightly frightened. Share price up 2%."; } const f = B(); spend(f,"other"); return `You don’t have enough actuaries to explain it. Fine: ${fmt(f)}. (More Capital Modelling would help.)`; }},
    {label:() => "Blame the intern", run(){ mood(-1); return "The intern takes the fall. He’s fine. He has a jet ski."; }}]},
  {id:"lottery", title:"Someone won the lottery", text:"A Claims Office employee won the lottery and quit mid-call. The customer is still on hold.", choices:[
    {label:() => `Throw a farewell party (${fmt(B()*0.2)})`, run(){ spend(B()*0.2,"other"); S.buffs.morale = 25; return "Lovely party. They paid for the cake. Everyone works faster for a while."; }},
    {label:() => "Replace them with a cardboard cutout", run(){ return "Productivity is unchanged. Nobody has noticed. The cutout got a raise."; }}]},
  {id:"littleleague", title:"Sponsor a kids’ baseball team?", text:"The local little league needs new jerseys. They’d put Percy on the front.", choices:[
    {label:() => `Sponsor them (${fmt(B()*0.4)})`, run(){ spend(B()*0.4,"other"); mood(6); return `The ${coName()} Pigeons went 0–14. Everyone loves them anyway.`; }},
    {label:() => "Decline", run(){ mood(-2); return "A rival sponsored them instead. Their logo is an umbrella with no holes. Show-offs."; }}]},
  {id:"bigad", title:"The big game commercial", text:"Marketing wants a 30-second ad during the championship. Percy has been practicing a monologue.", choices:[
    {label:() => `Buy the ad (${fmt(B()*2)})`, run(){ spend(B()*2,"other"); S.buffs.sales = 45; return "Percy cried on camera. The whole country cried with him. Sales doubled for 45 seconds."; }},
    {label:() => `Film it on a phone (${fmt(B()*0.2)})`, run(){ spend(B()*0.2,"other"); S.buffs.sales = 15; return "It was vertical, blurry and charming. Sales doubled for 15 seconds."; }}]},
  {id:"calligraphy", title:"A complaint in calligraphy", text:"A customer hand-lettered a four-page complaint on parchment. It’s honestly beautiful.", choices:[
    {label:() => "Reply in calligraphy", run(){ mood(5); return "It took Legal two days and a feather. The customer framed it."; }},
    {label:() => "Send the standard form letter", run(){ mood(-2); return "Form letter 14: “We value your feedback.” They valued it less."; }}]},
  {id:"fourday", title:"A four-day work week?", text:"Staff want to try a four-day week. The City has never heard of such a thing.", choices:[
    {label:() => "Try it", run(){ S.buffs.morale = 60; S.stock *= 0.98; return "Staff are thriving and faster than ever. Analysts gasped audibly. Share price down 2%."; }},
    {label:() => "Five days, like our ancestors", run(){ return "Staff sigh in perfect unison. It sounds like wind."; }}]},
  {id:"ghost", title:"The building is haunted", text:"The night guard reports a ghost on the third floor asking about life insurance.", choices:[
    {label:() => `Sell it a policy (+${fmt(B()*0.6)})`, run(){ gain(B()*0.6); return "Premium collected. Claims risk: extremely low. It’s already dead."; }},
    {label:() => `Call an exorcist (${fmt(B()*0.3)})`, run(){ spend(B()*0.3,"other"); S.buffs.morale = 20; return "The ghost is gone and staff feel better. The exorcist asked about life insurance."; }}]},
  {id:"smoke", title:"Wildfire smoke", text:"Smoke from fires two states away has turned every white couch in town beige.", choices:[
    {label:() => `Pay for cleaning (${fmt(B()*1.5)})`, run(){ spend(B()*1.5,"paid"); mood(9); return "Couches are white again. Customers are telling their friends about you."; }},
    {label:() => "Ask for a photo of every ash particle", run(){ mood(-8); if (Math.random() < .3) sue(B()*1.5); return "Several customers sent 4,000 photos each. One sent a lawyer."; }}]},
  {id:"parade", title:"The city parade", text:"There’s a spot open for a float. Percy is already inflating himself.", choices:[
    {label:() => `Build a giant Percy float (${fmt(B()*0.5)})`, run(){ spend(B()*0.5,"other"); S.buffs.sales = 25; mood(2); return "The float was 40 feet tall and only lost its head once. Sales doubled for 25 seconds."; }},
    {label:() => "Skip it", run(){ return "Percy watched from the roof. He’s not speaking to you."; }}]},
  {id:"tvshow", title:"A TV show is investigating you", text:"A consumer reporter with very good hair is in the lobby asking “tough questions.”", choices:[
    {label:() => "Go on camera", run(){ if (S.happy >= 60){ S.stock *= 1.03; mood(3); return "They found nothing. The segment was so boring the show got cancelled. Share price up 3%."; } S.stock *= 0.95; mood(-5); return "They found your reviews. Share price down 5%. Your hair looked great, though."; }},
    {label:() => "No comment", run(){ S.stock *= 0.98; mood(-2); return "“No comment” was the headline. Share price down 2%."; }}]},
  {id:"solar", title:"Solar panels for the roof?", text:"A sustainability fund says it’ll consider your stock if the building looks greener.", choices:[
    {label:() => `Install them (${fmt(B())})`, run(){ spend(B(),"other"); mood(3); S.stock *= 1.02; return "The fund bought in. The roof sign is now solar powered and blinks with more conviction."; }},
    {label:() => "Paint the roof green instead", run(){ S.stock *= 1.005; return "It worked, a little. The fund wants a follow-up meeting."; }}]},
  {id:"intern2", title:"The intern approved everything", text:"For one glorious hour, a new intern approved every claim in the system.", choices:[
    {label:() => `Let it stand (${fmt(B()*1.2)})`, run(){ spend(B()*1.2,"paid"); mood(12); return "Customers think it’s a miracle. Some have started a small fan club. Mood way up."; }},
    {label:() => "Reverse every approval", run(){ mood(-10); if (Math.random() < .35) sue(B()*2); return "Customers got approval emails, then denial emails. Some of them have lawyers."; }}]},
  {id:"capsule", title:"A time capsule", text:"Workers found a 1952 time capsule holding the company’s first promise: “We will pay every claim, fully and promptly.”", choices:[
    {label:() => "Frame it in the lobby", run(){ mood(5); S.stock *= 0.99; return "Customers are moved. Shareholders are nervous. Share price down 1%."; }},
    {label:() => "Bury it again, deeper", run(){ return "It’s under the parking lot now. Legal is relieved."; }}]},
  {id:"vegas", title:"The industry conference", text:"This year it’s in Las Vegas. The keynote is called “Disrupting Disruption.”", choices:[
    {label:() => `Send the whole team (${fmt(B())})`, run(){ spend(B(),"other"); S.buffs.morale = 40; return "Everyone came back tan and energized. One person came back married. Staff work faster for a while."; }},
    {label:() => "Send Percy alone", run(){ S.buffs.sales = 20; return "Percy won £400 at blackjack and signed three new clients. Sales doubled briefly."; }}]},
  {id:"forecaster", title:"A weatherman for hire", text:"A local weatherman offers to make his forecasts “more optimistic” for a small fee.", choices:[
    {label:() => `Pay him (${fmt(B()*0.5)})`, run(){ spend(B()*0.5,"other"); return "Every forecast now says “sunny.” The weather did not get the memo."; }},
    {label:() => "Decline", run(){ return "He shrugs and goes back to saying “bring snacks.”"; }}]},
  {id:"lawyerup", title:"A former customer sues", text:"Someone you denied three years ago is back. Their lawyer has a billboard and a catchphrase.", cond:() => S.quarter > 2, choices:[
    {label:() => `Settle quietly (${fmt(B()*1.2)})`, run(){ spend(B()*1.2,"other"); return "Settled. The billboard now says “We won!” next to your logo."; }},
    {label:() => "Fight it in court", run(){ if (lv("legal") >= 2 && Math.random() < .7) return "Your Legal team found clause 88-Q. Case dismissed. The lawyer’s billboard is for rent."; sue(B()*2.5); return "Court date set. Your lawyers seem “optimistic,” which is not a word lawyers use."; }}]},
  {id:"scorchie", title:"The building melted a car", text:"Your curved glass facade focused the afternoon sun into a beam and melted a parked sports car. The papers are calling it a death ray.", choices:[
    {label:() => `Pay for the car (${fmt(B())})`, run(){ spend(B(),"paid"); mood(4); return "The owner is placated. A tabloid fried an egg on the pavement for a photo."; }},
    {label:() => `Sell tickets to the beam (+${fmt(B()*0.6)})`, run(){ gain(B()*0.6); mood(-4); return "Tourists love it. The car owner does not. Legal is “monitoring the situation.”"; }}]},
  {id:"lunch", title:"A four-hour lunch", text:"A senior broker invites you to lunch at a members’ club. It starts at noon. It may never end.", choices:[
    {label:() => `Go, and pick up the bill (${fmt(B()*0.4)})`, run(){ spend(B()*0.4,"other"); S.buffs.sales = 30; return "You agreed to nothing in writing. He sent three huge slips by 5pm. Business doubled for 30 seconds."; }},
    {label:() => "Eat a sandwich at your desk", run(){ return "The broker took his business to the box next door. He was seen laughing about it."; }}]},
  {id:"catbond", title:"Issue a catastrophe bond?", text:"Investors will hand you cash now. If a big storm hits, they lose it instead of you. They seem fine with this.", choices:[
    {label:() => `Issue it (+${fmt(B()*1.2)})`, run(){ gain(B()*1.2); if (Math.random() < .4){ S.buffs.surge = 25; return "Cash in hand. Then a storm arrived right on cue. Claims are coming."; } return "Cash in hand. The investors are toasting “uncorrelated returns.”"; }},
    {label:() => "Keep the risk", run(){ return "Brave. Or the cat modellers forgot to email you."; }}]},
  {id:"satellite", title:"A broker brings a satellite", text:"A broker wants cover for a satellite launching on a rocket that has worked “most of the time.”", choices:[
    {label:() => `Write it (+${fmt(B()*1.6)})`, run(){ gain(B()*1.6); if (Math.random() < .3) addClaim("Orbital Ventures Ltd","The satellite reached orbit, waved, and fell back as a shooting star.", B()*4.5); return "Premium collected. The rocket is, for now, a rocket."; }},
    {label:() => "Pass", run(){ return "The box next door wrote it. They’re watching the launch through their fingers."; }}]},
  {id:"canal", title:"A cargo ship is stuck", text:"A container ship you cover is wedged sideways in a canal. Half the world’s shopping is waiting behind it.", choices:[
    {label:() => `Pay the salvage team (${fmt(B()*1.5)})`, run(){ spend(B()*1.5,"paid"); mood(5); return "One very small digger freed it. The digger driver is now famous."; }},
    {label:() => "Argue it’s “technically parked”", run(){ mood(-6); if (Math.random() < .4) sue(B()*2); return "The shipping company does not agree that it’s parked."; }}]},
  {id:"bowler", title:"The dress code memo", text:"The old guard wants to bring back bowler hats for everyone in The Room.", choices:[
    {label:() => "Hats for everyone", run(){ S.stock *= 1.01; return "Analysts call it “heritage.” Share price up 1%."; }},
    {label:() => "Allow trainers instead", run(){ S.buffs.morale = 30; return "Staff are delighted. One of the old guard fainted onto a leather sofa."; }}]},
  {id:"tube", title:"Tube strike", text:"Nobody can get to the office. Half the staff are walking. One is rowing up the Thames.", choices:[
    {label:() => "Let everyone work from home", run(){ S.buffs.morale = 25; return "Work got done. Several people discovered daylight."; }},
    {label:() => `Hire rickshaws (${fmt(B()*0.3)})`, run(){ spend(B()*0.3,"other"); S.stock *= 1.01; return "Everyone arrived damp but on time. Analysts admire the “grit.”"; }}]},
  {id:"drizzle", title:"It’s raining again", text:"It has drizzled for 41 days straight. A customer asks whether “mild dampness” is covered.", choices:[
    {label:() => `Pay a little goodwill (${fmt(B()*0.3)})`, run(){ spend(B()*0.3,"paid"); mood(4); return "They bought an umbrella with it. One without holes, sadly."; }},
    {label:() => "Point at the window", run(){ mood(-2); return "They agreed it’s always like this. Nobody is happy, but nobody is surprised."; }}]},
  {id:"coffeeHouse", title:"The founders’ coffee house", text:"A historian says your syndicate began in a 17th-century coffee house, where deals were done over very strong coffee.", choices:[
    {label:() => `Open a coffee bar in The Room (${fmt(B()*0.5)})`, run(){ spend(B()*0.5,"other"); S.buffs.morale = 35; S.buffs.sales = 15; return "Brokers are writing faster and talking faster. Nobody has blinked in an hour."; }},
    {label:() => "Stick to tea", run(){ mood(1); return "Very traditional. Very calm. Slightly slower."; }}]},
];

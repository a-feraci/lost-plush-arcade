"use strict";

const $ = (selector) => document.querySelector(selector);
const main = $("#content");
const first = "2026-11-14";
const storageKey = "snowbow-station-1";
const eastern = new Intl.DateTimeFormat("en-CA", { timeZone:"America/New_York", year:"numeric", month:"2-digit", day:"2-digit" });
const dayLabel = new Intl.DateTimeFormat("en-US", { timeZone:"UTC", weekday:"long", month:"long", day:"numeric" });
const monthLabel = new Intl.DateTimeFormat("en-US", { timeZone:"UTC", month:"long", year:"numeric" });
const date = (id) => new Date(id + "T12:00:00Z");
const iso = (value) => value.toISOString().slice(0,10);
const today = () => { const p = Object.fromEntries(eastern.formatToParts(new Date()).map(({type,value})=>[type,value])); return [p.year,p.month,p.day].join("-"); };
const available = (id) => id < first ? first : id;
function step(id, amount) { const d=date(id); d.setUTCDate(d.getUTCDate()+amount); return iso(d); }
function monthStep(id, amount) { const d=date(id); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth()+amount); return iso(d); }
function dates(id, mode) {
  const start = mode==="Week" ? step(id,-date(id).getUTCDay()) : monthStep(id,0);
  const count = mode==="Week" ? 7 : Number(step(monthStep(start,1),-1).slice(8));
  return Array.from({length:count}, (_,i)=>step(start,i));
}
function validDay(id) {
  return typeof id==="string" && /^\d{4}-\d\d-\d\d$/.test(id) && id>=first && Number.isFinite(date(id).getTime()) && iso(date(id))===id;
}
const escape = (value) => String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
const uid = () => crypto.randomUUID?.() ?? "item-"+Math.random().toString(36).slice(2);
const examples = [["08:00","Backpack check"],["10:00","Read a few pages"],["13:00","A little movement"],["15:00","Make something silly"],["19:00","Evening wind-down"]];
const november14Plan = [
  ["15:00","Make something silly"],
  ["18:00","Eat dinner"],
  ["20:00","Pick out an outfit for the comic store tomorrow"],
  ["20:30","Take a bath"],
  ["22:00","Evening wind-down"],
  ["","Pack a bag for tomorrow"],
  ["","Do chores to unlock the Advent calendar"]
];
const events = {"2026-11-21":"🏅 5K with Mom · Running buddies","2026-11-22":"✨ Pokémon card event"};
const chores = [
  {id:"teeth",title:"Brush my teeth"},
  {id:"bed",title:"Make my bed"},
  {id:"water",title:"Drink water"},
  {id:"room",title:"10-minute room pickup"},
  {id:"homework",title:"Do my homework",school:true},
  {id:"violin",title:"Practice violin",school:true},
  {id:"clothes",title:"Pick out tomorrow’s clothes",school:true}
];
function choresFor(id) {
  const weekday=date(id).getUTCDay();
  return chores.filter(chore=>!chore.school||(weekday>=1&&weekday<=4));
}
function choreProgress(id) {
  const required=choresFor(id);
  const done=required.filter(chore=>Boolean(state.chores[id]?.[chore.id])).length;
  return {required,done,complete:done===required.length};
}
const oldGoalPrompts = ["Something I want to learn","A game or creature I want to invent","A thing I'd like to try with Mom","One way to be a good friend","My tiny next step"];
const moods = {"😊":"Happy","☁️":"Quiet","😴":"Sleepy","🌧️":"Sad","🫤":"Mixed up","✨":"Excited"};
const stickers = ["⭐","🎀","🐰","🐱","❄️","🍓","🍀","🛸"];
const habitIcons = ["🎀","🦌","🐇","🍓","🗝️","🌙","🫧","🪞","🕯️","🧸","🛸","❄️","🎟️","🍒","⭐","🪻"];
const pageArt = {
  movies:["cinema","Velvet and Latch in an empty pink cinema"],
  habits:["garden","Velvet and Latch tending snowdrops in an indoor winter garden"],
  goals:["goals","Velvet and Latch with a notebook and paper stars"],
  advent:["tickets","Velvet and Latch at a ticket counter beside the mint door"],
  settings:["platform-keepers","A portrait of Velvet and Latch"]
};
const duration = 15 * 60 * 1000;
const tracks = [
  ["The Claw Machine Is Dreaming","radio/arcade.wav","Music-box melody · slow, detuned bells"],
  ["Food Court, 2:03 AM","radio/food-court.wav","Electric piano · warm bass and a soft drum pulse"],
  ["Elevator That Goes Outside","radio/hallway.wav","Floating synth chords · distant answering notes"]
];
const movieCatalog = [
  {id:"elf",title:"Elf",art:"elf",year:2003,detail:"Holiday comedy"},
  {id:"home-alone",title:"Home Alone",art:"home-alone",year:1990,detail:"Holiday comedy"},
  {id:"santa-clause",title:"The Santa Clause",art:"santa-clause",year:1994,detail:"Holiday fantasy"},
  {id:"movie-0",title:"The Muppet Christmas Carol",art:"muppets",year:1992,detail:"Ghostly musical",spooky:true},
  {id:"movie-1",title:"Klaus",art:"klaus",year:2019,detail:"Animated winter adventure"},
  {id:"movie-2",title:"Arthur Christmas",art:"arthur",year:2011,detail:"Animated holiday comedy"},
  {id:"movie-3",title:"The Grinch (2018)",art:"grinch",year:2018,detail:"Animated holiday comedy"},
  {id:"movie-4",title:"The Nightmare Before Christmas",art:"nightmare",year:1993,detail:"Spooky stop-motion",spooky:true},
  {id:"kpop",title:"KPop Demon Hunters",art:"kpop",year:2025,detail:"K-pop and supernatural adventure",spooky:true}
];
const movieKey = (title) => title.trim().toLowerCase().replace(/\s+/g," ");
function movieDefaults(saved=[]) {
  const firstPicks=movieCatalog.map(({id,title,spooky})=>{
    const existing=saved.find(movie=>movie.id===id||movieKey(movie.title)===movieKey(title));
    return existing??{id,title,done:false,spooky:Boolean(spooky)};
  });
  return [...firstPicks,...saved.filter(movie=>!firstPicks.some(pick=>pick.id===movie.id))];
}
function upgrade(saved) {
  const previousGoals=saved.goals.filter(goal=>!oldGoalPrompts.some((title,i)=>
    goal.id==="goal-"+i&&goal.title===title&&!goal.body&&goal.sticker===stickers[i]&&goal.done===undefined));
  const tasks=saved.november14Plan
    ? saved.tasks
    : {...saved.tasks,[first]:revisedNovember14(saved.tasks[first]??[])};
  return {chores:{},...saved,tasks,november14Plan:true,goals:previousGoals,movies:movieDefaults(saved.movies)};
}
function revisedNovember14(tasks) {
  const titleKey = (title) => title.trim().toLowerCase();
  const oldExamples=examples.slice(0,3);
  const scheduled=november14Plan.map(([time,title],index)=>{
    const existing=tasks.find(task=>titleKey(task.title)===titleKey(title));
    return {id:existing?.id??"nov14-"+index,time,title,done:existing?.done??false};
  });
  const personal=tasks.filter(task=>
    !november14Plan.some(([,title])=>titleKey(task.title)===titleKey(title)) &&
    !oldExamples.some(([time,title])=>task.time===time&&titleKey(task.title)===titleKey(title)));
  return [...scheduled,...personal];
}
function newTasks() { return examples.map(([time,title])=>({id:uid(),time,title,done:false})); }
function initial() {
  return {version:1,tasks:{[first]:revisedNovember14([])},november14Plan:true,journal:{},chores:{},
    habits:["Read","Draw or make something","Move or stretch","Brush teeth","Get my backpack ready","Take a quiet break"].map((title,i)=>({id:"habit-"+i,title,hidden:false})),
    marks:{}, goals:[],
    movies:movieDefaults(),
    radio:{index:0,position:0,volume:.18},timer:{end:0,left:duration}};
}
function validate(s) {
  const obj = (v) => v && typeof v==="object" && !Array.isArray(v);
  const str = (v,n) => typeof v==="string" && v.length<=n;
  const bool = (v) => typeof v==="boolean";
  const number = (v,min,max) => Number.isFinite(v) && v>=min && v<=max;
  const id = (v) => str(v,80) && /^[a-zA-Z0-9-]+$/.test(v) && !Object.hasOwn(Object.prototype,v);
  const item = (v,n) => obj(v) && id(v.id) && str(v.title,n);
  const list = (v,test) => Array.isArray(v) && v.length<=1000 && v.every(test) && new Set(v.map(x=>x.id)).size===v.length;
  const record = (v,key,test) => obj(v) && Object.entries(v).every(([k,x])=>key(k)&&test(x));
  return obj(s) && s.version===1 && (s.november14Plan===undefined||s.november14Plan===true) &&
    record(s.tasks,validDay,rows=>list(rows,x=>item(x,120)&&bool(x.done)&&typeof x.time==="string"&&(x.time===""||/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/.test(x.time)))) &&
    record(s.journal,validDay,x=>obj(x)&&str(x.text,12000)&&(x.mood===""||Object.hasOwn(moods,x.mood))) &&
    (s.chores===undefined||record(s.chores,validDay,x=>record(x,k=>chores.some(chore=>chore.id===k),v=>v===true))) &&
    list(s.habits,x=>item(x,72)&&bool(x.hidden)) && record(s.marks,validDay,x=>record(x,id,v=>v===true||habitIcons.includes(v))) &&
    list(s.goals,x=>item(x,120)&&str(x.body,2000)&&stickers.includes(x.sticker)&&(x.done===undefined||bool(x.done))) &&
    list(s.movies,x=>item(x,120)&&bool(x.done)&&bool(x.spooky)) &&
    obj(s.radio)&&Number.isInteger(s.radio.index)&&number(s.radio.index,0,tracks.length-1)&&number(s.radio.position,0,120)&&number(s.radio.volume,0,1) &&
    obj(s.timer)&&number(s.timer.end,0,9e15)&&number(s.timer.left,0,duration);
}
let state=initial(), storageIssue=false;
try {
  const raw=localStorage.getItem(storageKey);
  if (raw) { const saved=JSON.parse(raw); if (validate(saved)) state=upgrade(saved); else storageIssue=true; }
} catch { storageIssue=true; }
let noticeTimer;
function notice(message) {
  $("#notice").textContent=message;
  clearTimeout(noticeTimer);
  noticeTimer=setTimeout(()=>$("#notice").textContent="",3800);
}
function save() {
  try { localStorage.setItem(storageKey,JSON.stringify(state)); return true; }
  catch { notice("This browser couldn't save. Export a backup in Grown-up corner."); return false; }
}

let selected=available(today()), calendarMode="Week", habitDay=selected, habitMode="Week";
let editing="", secret=false, entryDate=selected, importCandidate;
const ticketSymbols = [
  ["🎀","Velvet’s bow"],["🗝️","Brass key"],["⭐","Paper star"],["🔔","Train bell"]
];
let ticketGame;

function newTicketGame() {
  const cards=[0,1,2,3,0,1,2,3];
  for (let i=cards.length-1;i>0;i--) {
    const j=Math.floor(Math.random()*(i+1));
    [cards[i],cards[j]]=[cards[j],cards[i]];
  }
  return {cards,faceUp:[],matched:[],message:""};
}

function ticketGamePanel() {
  const {cards,faceUp,matched,message}=ticketGame;
  const won=matched.length===cards.length;
  return `<section class="ticket-game stack" id="mint-game" aria-labelledby="mint-title">
    <img src="tickets.webp" alt="Velvet and Latch at the ticket booth beside the mint door">
    <h3 id="mint-title" tabindex="-1">The Lost Tickets</h3>
    <p>Velvet and Latch found eight tickets scattered across Platform 01. Flip two at a time to find all four matching pairs.</p>
    <div class="ticket-grid" role="group" aria-label="Ticket cards">
      ${cards.map((symbol,i)=>{
        const [icon,name]=ticketSymbols[symbol];
        const paired=matched.includes(i);
        const visible=paired||faceUp.includes(i);
        return action("flip-ticket",i,`<span aria-hidden="true">${visible?icon:"🎟️"}</span>`,
          `class="ticket-tile" aria-label="Ticket ${i+1}${visible?", "+name:""}${paired?", matched":""}" aria-disabled="${visible}" data-face="${visible}" data-matched="${paired}"`);
      }).join("")}
    </div>
    <p class="muted">${matched.length/2} of 4 pairs found</p>
    <p id="ticket-feedback" role="status">${message}</p>
    ${won?'<div class="event"><strong>Platform 01 is open!</strong><p>The ticket printer whirs to life. Out slides a note from two tiny plushes, one in a blue chullo and one with a tuft of blond yarn.</p><p>“Meet me on Platform 01. Bring a stuffie.”</p></div>':""}
    <div>${action("reset-tickets","",won?"Play again":"Shuffle and restart")}</div>
  </section>`;
}
let chosenDoor="", jumpToChores=false, editingGoal="";
let adventMonth=today().startsWith("2026-11")?"11":"12";
const adventPeriods={"11":{name:"November",start:14,end:30},"12":{name:"December",start:1,end:24}};
const pages={planner,habits:habitPage,goals:goalPage,movies:moviePage,advent,settings};
const page = () => { const key=location.hash.slice(1); return key==="grown"?"settings":Object.hasOwn(pages,key)?key:"planner"; };
function heading(title,description) {
  const [image,alt]=pageArt[page()];
  return `<header class="section-title illustrated-title"><div><h1>${title}</h1><p class="muted">${description}</p></div><img src="${image}.webp" alt="${alt}" decoding="async"></header>`;
}
const action = (name,value,label,other="") => `<button data-action="${name}" data-value="${escape(value)}" ${other}>${label}</button>`;
const modes = (name,current) => ["Week","Month"].map(mode=>action(name,mode,mode,`aria-pressed="${mode===current}"`)).join("");
function prettyTime(time) {
  if (!time) return "Anytime";
  const [hour,min]=time.split(":");
  return `${+hour%12||12}:${min} ${+hour<12?"am":"pm"}`;
}
function choreCard() {
  const {required,done,complete}=choreProgress(selected);
  const future=selected>today();
  const label=dayLabel.format(date(selected));
  return `<section class="card mint stack" id="daily-chores" tabindex="-1" aria-labelledby="chores-title">
    <div class="row spread"><div><p class="eyebrow">❄ ${label}</p><h2 id="chores-title">Daily chores</h2></div>
      ${selected!==available(today())?action("chores-today","","Today’s chores"):""}</div>
    <div class="row spread"><p class="muted">${future?"This checklist opens on its date.":complete?"All done for this day!":"One little thing at a time."}</p><strong class="tag">${done} of ${required.length} done</strong></div>
    <progress aria-label="Daily chores progress" max="${required.length}" value="${done}"></progress>
    <ul class="chore-list">${required.map(chore=>`<li><label class="row"><input type="checkbox" data-chore="${chore.id}" ${state.chores[selected]?.[chore.id]?"checked":""} ${future?"disabled":""}><span>${chore.title}</span></label></li>`).join("")}</ul>
    ${inAdvent(selected)?`<p class="muted">Finish this checklist to unlock this date’s Advent door.</p>
    ${!future&&complete?'<div>'+action("from-chores",selected,"Open my Advent door",'class="primary"')+'</div>':""}`:""}</section>`;
}
function planner() {
  const days=dates(selected,calendarMode);
  const list=[...(state.tasks[selected]??[])].sort((a,b)=>(a.time||"99").localeCompare(b.time||"99"));
  const existing=list.find(x=>x.id===editing);
  const entries=days.map(id=>{
    const mark=events[id]||state.tasks[id]?.length||state.journal[id];
    const label=dayLabel.format(date(id))+(events[id]?", event":"");
    return action("day",id,`${+id.slice(8)}${mark?'<i class="dot" aria-hidden="true"></i>':""}`,`aria-label="${label}" ${selected===id?'aria-current="date"':""} ${id<first?"disabled":""}`);
  }).join("");
  return `<header class="hero"><div class="hero-copy"><p class="eyebrow">❄ ${dayLabel.format(date(available(today())))}</p><h1>Lost Plush <em>Arcade</em></h1><p>The mall closed hours ago. The claw machine is still dreaming.</p><div class="hero-actions"><a class="primary" href="#day-plan">Open the planner ↓</a><a class="secondary" href="#chores">Daily chores</a></div></div>
    <figure class="hero-art"><img src="arcade-hero.webp" alt="A glowing claw machine full of plushies in an empty pastel mall"></figure></header>
  <div class="layout"><section class="card stack" id="day-plan" aria-labelledby="planner-title">
    <div class="row spread"><div class="panel-heading"><img class="keeper-thumb" src="platform-keepers.webp" alt="" width="52" height="52"><div><p class="eyebrow">❄ Arcade calendar</p><h2 id="planner-title">My planner</h2></div></div><div class="row">${modes("calendar",calendarMode)}</div></div>
    <div class="row spread">${action("period",-1,"‹",`aria-label="Previous ${calendarMode.toLowerCase()}" ${days[0]<=first?"disabled":""}`)} <strong>${monthLabel.format(date(selected))}</strong>
    <div class="row">${action("day",available(today()),"Today")} ${action("period",1,"›",`aria-label="Next ${calendarMode.toLowerCase()}"`)}</div></div>
    <div class="grid">${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(x=>`<small>${x}</small>`).join("")}${calendarMode==="Month"?"<span></span>".repeat(date(days[0]).getUTCDay()):""}${entries}</div>
    <div class="row spread"><h3>${dayLabel.format(date(selected))}</h3>${action("dated-journal",selected,"Open journal for this day")}</div>
    ${events[selected]?`<p class="event">${events[selected]}</p>`:""}
    ${list.length?`<ul class="tasks">${list.map(x=>`<li><time>${prettyTime(x.time)}</time><label><input type="checkbox" data-task="${x.id}" ${x.done?"checked":""}><span>${escape(x.title)}</span></label>${action("edit",x.id,"Edit",`aria-label="Edit ${escape(x.title)}"`)}</li>`).join("")}</ul>`:'<p class="muted">This day is yours to fill.</p>'}
    <form data-form="task" class="stack"><label>Task <input name="title" required maxlength="120" value="${escape(existing?.title)}" placeholder="Give a penguin a name"></label>
    <div class="row"><label>Time <input name="time" type="time" value="${existing?.time??""}"></label>${existing?`<label>Move to date <input name="move" type="date" min="${first}" value="${selected}" required></label>`:""}</div>
    <div class="row"><button class="primary">${existing?"Save task":"Add task"}</button>${existing?`${action("remove",existing.id,"Remove task",'type="button"')} ${action("edit","","Cancel",'type="button"')}`:""}</div></form>
    ${!list.length?action("examples","","Add example tasks"):""}</section>
  <aside class="stack">${choreCard()}<section class="card stack"><h2>On the calendar</h2>${Object.entries(events).map(([id,event])=>`<div class="event-preview"><div><p class="eyebrow">${dayLabel.format(date(id))}</p><p>${event}</p></div>${action("day",id,`Open Nov ${+id.slice(8)}`)}`).join("")}</section>
  <section class="card keeper-card stack"><div class="panel-heading"><img class="keeper-thumb" src="platform-keepers.webp" alt="A stitched pink deer beside a floppy bunny with a stitched eye patch" width="84" height="84"><h2>The Platform Keepers</h2></div>
    <p>Velvet, the deer, has a key sewn to her bow. Latch, the rabbit, carries a ticket dated tomorrow. Their photo keeps turning up in the lost-and-found.</p>
    ${action("secret","",secret?"Close the mint door":"Peek through the mint door",`aria-expanded="${secret}"${secret?' aria-controls="mint-game"':""}`)}
    ${secret?ticketGamePanel():""}</section></aside></div>`;
}

function habitIcon(id,habit) {
  const mark=state.marks[id]?.[habit];
  if (mark!==true) return mark??"·";
  // Older backups stored a checkmark as true. Give it a stable icon.
  const hash=Array.from(id+habit).reduce((number,char)=>(number*31+char.codePointAt(0))>>>0,0);
  return habitIcons[hash%habitIcons.length];
}
let lastHabitIcon="";
function habitPage() {
  const days=dates(habitDay,habitMode);
  return `${heading("Habit garden","Tap a date to give one little habit a leaf.")}<section class="card stack">
  <div class="row spread"><strong>${monthLabel.format(date(habitDay))}</strong><div class="row">${modes("habit-mode",habitMode)}</div></div>
  <div class="row">${action("habit-period",-1,"‹ previous",days[0]<=first?"disabled":"")}${action("habit-today","","Today")}${action("habit-period",1,"Next ›")}</div>
  <div class="scroll" tabindex="0" aria-label="Habit grid, scroll for more days"><table><thead><tr><th scope="col">Habit</th>${days.map(d=>`<th scope="col" aria-label="${dayLabel.format(date(d))}">${+d.slice(8)}</th>`).join("")}</tr></thead>
  <tbody>${state.habits.filter(x=>!x.hidden).map(x=>`<tr><th scope="row">${escape(x.title)}</th>${days.map(d=>`<td>${action("mark",d+"|"+x.id,habitIcon(d,x.id),`aria-label="${escape(x.title)}, ${dayLabel.format(date(d))}" aria-pressed="${Boolean(state.marks[d]?.[x.id])}" ${d<first?"disabled":""}`)}</td>`).join("")}</tr>`).join("")}</tbody></table></div></section>
  <section class="card stack"><details><summary>Manage habits</summary><div class="stack">
  ${state.habits.map(x=>`<form class="row" data-form="habit" data-id="${x.id}"><label>Name <input name="title" required maxlength="72" value="${escape(x.title)}"></label><button>Rename</button>${action("hide",x.id,x.hidden?"Show":"Hide",'type="button"')}</form>`).join("")}</div></details>
  <form class="row" data-form="habit"><label>New habit <input name="title" required maxlength="72"></label><button class="primary">Add habit</button></form></section>`;
}
function goalPage() {
  const editing=state.goals.find(goal=>goal.id===editingGoal);
  return `${heading("My goals","Pick something you want to do, then write down one small step.")}
    <section class="card stack"><h2>${editing?"Edit goal":"Add a goal"}</h2>
    <form data-form="goal" class="stack" data-id="${editing?.id??""}">
      <label for="goal-title">What do I want to do?</label><input id="goal-title" name="title" required maxlength="120" value="${escape(editing?.title)}" placeholder="Learn a new song on violin">
      <label for="goal-step">What’s my first small step?</label><textarea id="goal-step" name="step" rows="3" maxlength="2000" placeholder="Play the first four notes slowly">${escape(editing?.body)}</textarea>
      <div class="row"><button class="primary">Save goal</button>${editing?action("edit-goal","","Cancel",'type="button"'):""}</div>
    </form></section>
    ${state.goals.length?`<div class="tiles">${state.goals.map(goal=>`<section class="card stack">
      <h2>${escape(goal.title)}</h2>${goal.body?`<p class="goal-step"><strong>First step:</strong> ${escape(goal.body)}</p>`:""}
      <div class="row spread"><label class="row"><input type="checkbox" data-goal-done="${goal.id}" ${goal.done?"checked":""} aria-label="Finished ${escape(goal.title)}"> Finished</label>
      ${action("edit-goal",goal.id,"Edit",`aria-label="Edit ${escape(goal.title)}"`)}</div>
    </section>`).join("")}</div>`:""}`;
}
function moviePage() {
  const watched=state.movies.filter(x=>x.done).length;
  return `${heading("The Midnight Cinema","Winter comedies, animated adventures, and a few spooky picks.")}
  <section class="movie-grid" aria-label="Movie watchlist">${state.movies.map(x=>{
    const meta=movieCatalog.find(m=>m.id===x.id||movieKey(m.title)===movieKey(x.title));
    return `<article class="movie-card">
      ${meta?`<img src="posters/${meta.art}.webp" alt="" loading="lazy" decoding="async" width="280" height="420">`:'<div class="movie-placeholder" aria-hidden="true"><span>✧</span></div>'}
      <div class="movie-copy"><h2>${escape(x.title)}</h2>
      ${meta?`<p class="movie-meta">${meta.year} · ${meta.detail}</p>`:""}
      ${x.spooky?'<span class="tag">Spookier</span>':""}
      <label class="movie"><input type="checkbox" data-movie="${x.id}" ${x.done?"checked":""} aria-label="Watched ${escape(x.title)}"><span>Watched</span></label></div></article>`;
  }).join("")}</section>
  <section class="card stack"><div class="row spread"><h2>Add a favorite</h2><strong class="tag" id="movie-count">${watched} of ${state.movies.length} watched</strong></div>
  <form class="stack" data-form="movie"><label>Movie to add <input name="title" required maxlength="120"></label><label class="row"><input type="checkbox" name="spooky"> Spookier pick</label><div><button class="primary">Add movie</button></div></form></section>`;
}
function inAdvent(id) {
  const period=adventPeriods[id.slice(5,7)];
  const number=Number(id.slice(8));
  return id.startsWith("2026-")&&period&&number>=period.start&&number<=period.end;
}
const novemberChapters = [
  {
    title:"The Ticket Dated Tomorrow",
    alt:"Velvet and Latch wait on a snowy platform near a glowing mint door",
    text:[
      "At closing time, every arcade screen went dark. A ticket slid out of the claw machine. It was stamped with tomorrow’s date and had one instruction penciled on the back: Bring a stuffie.",
      "On Platform 01, a pink deer named Velvet turned the key sewn to her bow. The mint door opened onto a room where the Christmas tree grew down from the ceiling. Latch, the rabbit, punched a star in the ticket. Somewhere behind the wall, a toy train rang its bell."
    ]
  },
  {
    title:"The Bell with No Clapper",
    alt:"Velvet and Latch find a little brass bell beneath an upside-down Christmas tree",
    text:[
      "They followed the sound beneath the upside-down tree. A brass bell hung from its lowest branch. Latch tipped it over. There was nothing inside to make it ring.",
      "Velvet set their ticket beneath it. The bell chimed once, and frost crept across the ticket in the shape of a tiny counter. Latch knew the counter. It was the mall’s lost-and-found, the one that hadn’t opened in years."
    ]
  },
  {
    title:"The Mirror in Drawer Seven",
    alt:"The plush pair find a pocket mirror at the lost-and-found counter",
    text:[
      "Velvet’s key fit every drawer in the lost-and-found except Drawer Seven. Latch held the ticket to the keyhole. The drawer slid open on its own.",
      "Inside lay a pocket mirror. It reflected the pink elevator down the hall, with one extra button shaped like a star. Velvet looked up. In the real hallway, the button was missing."
    ]
  },
  {
    title:"The Floor Between Floors",
    alt:"Latch holds up the mirror beside a pink elevator with a glowing star button",
    text:[
      "Latch tilted the mirror toward the elevator. The star button appeared in the glass. Velvet pressed the reflection, and the elevator chimed in the same note as the hollow bell.",
      "They got off between floors. A strip of light led down the carpet to the Midnight Cinema. The projector was already running. Its only audience was a row of empty seats covered in snow."
    ]
  },
  {
    title:"Seven Stars on Film",
    alt:"Velvet and Latch discover a glowing reel in the cinema projection booth",
    text:[
      "The movie showed the mall as it looked last winter. Onscreen, a toy train took a bend and vanished. Latch rewound the reel. At the bend, one of the seven stars above the track was dark.",
      "Velvet paused the film. A yellow paper star slipped from the projector. On its back, in tiny pencil, someone had drawn the track switch behind Platform 01."
    ]
  },
  {
    title:"The Switch Under the Snow",
    alt:"Velvet and Latch fit a yellow paper star into a snowy rail switch",
    text:[
      "Behind Platform 01, Latch brushed snow off the old track switch. It had a star-shaped slot. Velvet slid in the paper star, and a second rail unfolded from beneath the first.",
      "Warm light ran along the sleepers and disappeared around the bend. The ticket now had two punched seats and a departure time: 2:03. The station clock had been stuck on 2:02 all winter."
    ]
  },
  {
    title:"Two Seats at 2:03",
    alt:"Velvet and Latch wait beside an arriving pink toy train at the empty station",
    text:[
      "At 2:03 the clock ticked. A little pink train rolled in without a driver. Its two velvet seats were dusty. From beneath one of them, someone tapped three times.",
      "Latch tapped back. The tapping stopped. When the carriage door opened, an extra set of pawprints appeared on the step, one by one, as if someone very small had boarded just ahead of them."
    ]
  },
  {
    title:"The Passenger in the Frost",
    alt:"Velvet and Latch ride the train through the snowy mall beside a frosted window",
    text:[
      "Velvet and Latch followed the tiny pawprints along the carriage. Beneath the last seat they found a forgotten plush mouse, curled around a brass tag. The mouse had been waiting for someone to punch the ticket so the train could find its way home.",
      "The train carried all three through the bend at last. Outside the window was the arcade, but every sign pointed toward a mint door neither of them remembered. The mouse held up the brass tag. It read: Platform 02."
    ]
  }
];
function chapterFor(id) {
  return id.startsWith("2026-11-") ? novemberChapters[Number(id.slice(8))-14] : undefined;
}
const novemberStoryArt = [
  "tickets.webp",
  "story/story-dec-0.jpg",
  "story/story-dec-5.jpg",
  "story/story-dec-10.jpg",
  "cinema.webp",
  "story/story-dec-15.jpg",
  "story/story-dec-20.jpg",
  "story/story-dec-23.jpg"
];
function novemberStory(id,chapter) {
  const chapterNumber=Number(id.slice(8))-13;
  const previous=step(id,-1);
  const next=step(id,1);
  return `<article class="lore stack"><img src="${novemberStoryArt[chapterNumber-1]}" alt="">
    <div class="lore-copy stack"><p class="eyebrow">Platform 01 · Chapter ${chapterNumber} of ${novemberChapters.length}</p><h3>${chapter.title}</h3>
    ${chapter.text.map(line=>`<p>${line}</p>`).join("")}
    <div class="row">${chapterFor(previous)?action("door",previous,"‹ Previous chapter"):""}${chapterFor(next)?action("door",next,"Next chapter ›"):""}</div></div></article>`;
}
function advent() {
  const current=today();
  const {name,start,end}=adventPeriods[adventMonth];
  const doors=Array.from({length:end-start+1},(_,i)=>`2026-${adventMonth}-${String(i+start).padStart(2,"0")}`);
  return `${heading("Advent", "Finish a day’s chores to unlock its door.")}
    <section class="card pink stack" aria-label="${name} Advent doors">
      <div class="row spread"><h2>${name} ${start}–${end}</h2><div class="row">${Object.entries(adventPeriods).map(([month,period])=>action("advent-month",month,period.name,`aria-pressed="${month===adventMonth}"`)).join("")}</div></div>
      ${adventMonth==="11"?'<p class="muted">Follow Velvet and Latch through Platform 01, one chapter a day from November 14–21.</p>':""}
      ${chosenDoor?adventDetails(current):""}
      <div class="door-grid">
      ${doors.map(id=>{
        const upcoming=id>current;
        const unlocked=!upcoming&&choreProgress(id).complete;
        const status=upcoming?"Upcoming":unlocked?"Unlocked":"Chores left";
        return action("door",id,`<span aria-hidden="true">${unlocked?"✨":upcoming?"❄️":"🔒"}</span><b>${+id.slice(8)}</b><small>${status}</small>`,`class="door" aria-pressed="${chosenDoor===id}" aria-label="${name} ${+id.slice(8)}, ${status}"`);
      }).join("")}</div></section>`;
}
function adventDetails(current) {
  const id=chosenDoor;
  const {required,done,complete}=choreProgress(id);
  const label=dayLabel.format(date(id));
  const chapter=chapterFor(id);
  if (id>current) return `<section class="card ice stack" id="door-details" tabindex="-1"><h2>${label}</h2><p>This door’s checklist opens on that date.</p></section>`;
  return `<section class="card ${complete?"mint":"ice"} stack" id="door-details" tabindex="-1"><h2>${label}</h2>
    <p>${complete?"✨ Door unlocked!":`${done} of ${required.length} chores done.`}</p>
    ${complete?chapter?novemberStory(id,chapter):"<p>This door will have a surprise in a future update.</p>":action("go-chores",id,"Open this day’s chores")}</section>`;
}
function settings() {
  return `${heading("Settings","Save a backup or bring your progress to another browser.")}<section class="card stack"><h2>Browser backup</h2><p>This browser holds the planner, chores, habits, goals, watchlist, and journal. The backup includes readable journal text. Keep the file somewhere private.</p>
  <div class="row">${action("export","","Export backup")}<label>Import backup <input id="upload" type="file" accept="application/json,.json"></label></div><div id="backup-review" class="stack" aria-live="polite"></div></section>`;
}
function render() {
  const current=page();
  main.innerHTML=pages[current]();
  document.querySelectorAll(".rooms a").forEach(a=>a.hash==="#"+current?a.setAttribute("aria-current","page"):a.removeAttribute("aria-current"));
}

let tool="";
function openTool(name) {
  tool=name;
  for (const id of ["radio","timer","journal"]) {
    $("#"+id).hidden=id!==tool;
    $(`.bar [data-tool="${id}"]`).setAttribute("aria-expanded",String(id===tool));
  }
  document.body.classList.toggle("tool-open",Boolean(tool));
}
function showEntry(id) {
  entryDate=id;
  const entry=state.journal[id]??{text:"",mood:""};
  $("#entry-day").value=id;
  $("#entry").value=entry.text;
  $("#moods").innerHTML=Object.entries(moods).map(([emoji,name])=>action("mood",emoji,emoji,`aria-label="${name}" aria-pressed="${entry.mood===emoji}"`)).join("");
  $("#entry-note").textContent=entry.text||entry.mood?"Saved in this browser":"";
}
function editEntry(entry) {
  if (entry.text||entry.mood) state.journal[entryDate]=entry;
  else delete state.journal[entryDate];
  $("#entry-note").textContent=save()?"Saved in this browser":"Save failed";
}
$("#entry").addEventListener("input",e=>editEntry({text:e.target.value,mood:state.journal[entryDate]?.mood??""}));
$("#entry-day").addEventListener("change",e=>showEntry(validDay(e.target.value)?e.target.value:entryDate));

const audio=new Audio();
audio.loop=true;
audio.preload="none";
let seeking=false;
function loadTrack() {
  const [title,source,description]=tracks[state.radio.index];
  $("#track").textContent=title;
  $("#track-detail").textContent=description;
  $("#volume").value=Math.round(state.radio.volume*100);
  audio.src=source;
  audio.volume=state.radio.volume;
  seeking=state.radio.position>0;
}
audio.addEventListener("loadedmetadata",()=>{
  if (seeking && state.radio.position<audio.duration) audio.currentTime=state.radio.position;
  seeking=false;
});
let lastAudioSave=0;
audio.addEventListener("timeupdate",()=>{
  if (seeking) return;
  state.radio.position=audio.currentTime;
  if (Date.now()-lastAudioSave>3500) { save(); lastAudioSave=Date.now(); }
});
audio.addEventListener("play",()=>$("#play").textContent="Pause");
audio.addEventListener("pause",()=>$("#play").textContent="Play");
function play() {
  $("#audio-note").textContent="";
  audio.play().catch(e=>{ if (e.name!=="AbortError") $("#audio-note").textContent="Tap Play to try again."; });
}
$("#play").addEventListener("click",()=>{ if (audio.paused) play(); else { audio.pause(); save(); } });
$("#skip-track").addEventListener("click",()=>{
  const playing=!audio.paused;
  state.radio.index=(state.radio.index+1)%tracks.length;
  state.radio.position=0;
  loadTrack(); save();
  if (playing) play();
});
$("#volume").addEventListener("input",e=>{ audio.volume=state.radio.volume=+e.target.value/100; save(); });
window.addEventListener("pagehide",()=>{ if (audio.readyState && !seeking) { state.radio.position=audio.currentTime; save(); } });

function timerLeft() { return state.timer.end?Math.max(0,state.timer.end-Date.now()):state.timer.left; }
function timerRender() {
  const left=timerLeft();
  if (state.timer.end && left===0) { state.timer={end:0,left:0}; save(); }
  const seconds=Math.ceil(left/1000);
  const text=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,"0")}`;
  $("#clock").textContent=text;
  $("#timer-label").textContent=left?text:"Done!";
  $("#start").textContent=state.timer.end?"Pause":left===0||left===duration?"Start":"Resume";
  const note=left?"":"✨ Time’s up. Take a little break.";
  if (note!==$("#timer-note").textContent) $("#timer-note").textContent=note;
}
$("#start").addEventListener("click",()=>{
  const left=timerLeft();
  state.timer=state.timer.end?{left,end:0}:{left:left||duration,end:Date.now()+(left||duration)};
  save(); timerRender();
});
$("#reset").addEventListener("click",()=>{ state.timer={left:duration,end:0}; save(); timerRender(); });
setInterval(timerRender,250);

function exportData() {
  const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:"application/json"}));
  const link=document.createElement("a"); link.href=url; link.download="lost-plush-arcade-"+today()+".json"; link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
}
async function reviewBackup(input) {
  const review=$("#backup-review"), file=input.files[0];
  importCandidate=null;
  review.textContent="";
  if (!file) return;
  try {
    if (file.size>4000000) throw new Error();
    const data=JSON.parse(await file.text());
    if (input.files[0]!==file || review!==$("#backup-review")) return;
    if (!validate(data)) throw new Error();
    importCandidate=data;
    review.innerHTML=`<p>Replace this browser’s progress with ${escape(file.name)}?</p><div class="row">${action("import","","Replace progress")}${action("cancel-import","","Cancel")}</div>`;
  } catch { if (review===$("#backup-review")) review.textContent="Choose a valid planner backup."; }
}
const actions = {
  day(value) { selected=value; editing=""; render(); $("#day-plan").scrollIntoView({block:"nearest"}); },
  "chores-today"() { selected=available(today()); editing=""; render(); $("#daily-chores").focus(); },
  door(value) { chosenDoor=value; render(); $("#door-details").focus(); },
  "advent-month"(value) { adventMonth=value; chosenDoor=""; render(); $(`[data-action="advent-month"][data-value="${value}"]`)?.focus(); },
  "from-chores"(value) { adventMonth=value.slice(5,7); chosenDoor=value; location.hash="advent"; },
  "edit-goal"(value) { editingGoal=value; render(); $("#goal-title").focus(); },
  "go-chores"(value) { selected=value; editing=""; jumpToChores=true; location.hash="planner"; },
  calendar(value) { calendarMode=value; render(); },
  period(value) { actions.day(available(calendarMode==="Week"?step(selected,+value*7):monthStep(selected,+value))); },
  "dated-journal"(value) { showEntry(value); openTool("journal"); $("#entry").focus(); },
  edit(value) { editing=value; render(); $('[data-form="task"] [name="title"]').focus(); },
  remove(value) { state.tasks[selected]=state.tasks[selected].filter(x=>x.id!==value); editing=""; save(); render(); },
  examples() { state.tasks[selected]=newTasks(); save(); render(); },
  secret() {
    secret=!secret;
    if (secret) ticketGame??=newTicketGame();
    render();
    $(secret?"#mint-title":'[data-action="secret"]').focus();
  },
  "flip-ticket"(value) {
    const index=Number(value);
    const {cards,faceUp,matched}=ticketGame;
    if (!Number.isInteger(index)||index<0||index>=cards.length||matched.includes(index)||faceUp.includes(index)) return;
    if (faceUp.length===2) faceUp.length=0;
    faceUp.push(index);
    ticketGame.message=`${ticketSymbols[cards[index]][1]}. Flip one more ticket.`;
    if (faceUp.length===2) {
      const [first,second]=faceUp;
      if (cards[first]===cards[second]) {
        matched.push(first,second);
        faceUp.length=0;
        ticketGame.message=matched.length===cards.length?"You matched all four pairs!":"A match! Keep looking.";
      } else ticketGame.message="Different tickets. Turn over a new one to try again.";
    }
    $("#mint-game").outerHTML=ticketGamePanel();
    $(`[data-action="flip-ticket"][data-value="${index}"]`).focus({preventScroll:true});
  },
  "reset-tickets"() {
    ticketGame=newTicketGame();
    $("#mint-game").outerHTML=ticketGamePanel();
    $('[data-action="flip-ticket"]').focus();
  },
  "habit-mode"(value) { habitMode=value; render(); },
  "habit-period"(value) { habitDay=available(habitMode==="Week"?step(habitDay,+value*7):monthStep(habitDay,+value)); render(); },
  "habit-today"() { habitDay=available(today()); render(); },
  mark(value,button) {
    const [id,habit]=value.split("|");
    const marks=state.marks[id]??={};
    if (marks[habit]) delete marks[habit];
    else {
      const used=new Set(Object.keys(marks).map(key=>habitIcon(id,key)));
      used.add(lastHabitIcon);
      const unused=habitIcons.filter(icon=>!used.has(icon));
      const choices=unused.length?unused:habitIcons.filter(icon=>icon!==lastHabitIcon);
      marks[habit]=lastHabitIcon=choices[Math.floor(Math.random()*choices.length)];
    }
    button.setAttribute("aria-pressed",String(Boolean(marks[habit])));
    button.textContent=habitIcon(id,habit);
    save();
  },
  hide(value) {
    const habit=state.habits.find(x=>x.id===value); habit.hidden=!habit.hidden;
    save(); render(); $("details").open=true;
  },
  mood(value) {
    const old=state.journal[entryDate];
    editEntry({text:old?.text??"",mood:old?.mood===value?"":value});
    showEntry(entryDate);
    Array.from(document.querySelectorAll("#moods button")).find(button=>button.dataset.value===value)?.focus();
  },
  export:exportData,
  import() {
    if (!importCandidate) return;
    const previous=state; state=upgrade(importCandidate);
    if (!save()) { state=previous; return; }
    importCandidate=null; audio.pause(); loadTrack(); showEntry(entryDate); timerRender(); render(); notice("Backup imported.");
  },
  "cancel-import"() { importCandidate=null; render(); }
};
document.addEventListener("click",e=>{
  const button=e.target.closest("[data-action],[data-tool]");
  if (!button) return;
  if (button.dataset.tool) {
    const name=button.dataset.tool;
    if (tool!==name && name==="journal") showEntry(available(today()));
    openTool(tool===name?"":name);
    if (button.closest(".panel")) $(`.bar [data-tool="${name}"]`).focus();
    return;
  }
  actions[button.dataset.action]?.(button.dataset.value,button);
});
main.addEventListener("change",e=>{
  const el=e.target;
  if (el.id==="upload") { reviewBackup(el); return; }
  if (el.dataset.chore) {
    const id=el.dataset.chore;
    if (selected>today()||!choresFor(selected).some(chore=>chore.id===id)) return;
    const checked=state.chores[selected]??={};
    if (el.checked) checked[id]=true; else delete checked[id];
    save();
    $("#daily-chores").outerHTML=choreCard();
    $(`[data-chore="${id}"]`)?.focus({preventScroll:true});
    return;
  }
  if (el.dataset.task) state.tasks[selected].find(x=>x.id===el.dataset.task).done=el.checked;
  else if (el.dataset.movie) {
    state.movies.find(x=>x.id===el.dataset.movie).done=el.checked;
    $("#movie-count").textContent=`${state.movies.filter(x=>x.done).length} of ${state.movies.length} watched`;
  }
  else if (el.dataset.goalDone) state.goals.find(x=>x.id===el.dataset.goalDone).done=el.checked;
  else return;
  save();
});
main.addEventListener("submit",e=>{
  const form=e.target, kind=form.dataset.form;
  if (!kind) return;
  e.preventDefault();
  const values=new FormData(form), title=values.get("title").trim();
  if (!title) { notice("Add a name first."); return; }
  const id=form.dataset.id;
  if (kind==="goal") {
    const existing=state.goals.find(goal=>goal.id===id);
    const goal={id:existing?.id??uid(),title,body:values.get("step").trim(),sticker:existing?.sticker??stickers[0],done:existing?.done??false};
    const previous=state.goals;
    state.goals=existing?previous.map(x=>x.id===id?goal:x):[...previous,goal];
    if (!save()) { state.goals=previous; return; }
    editingGoal=""; render(); notice("Goal saved.");
    return;
  }
  if (kind==="task") {
    const destination=values.get("move")??selected;
    if (!validDay(destination)) return;
    const before=state.tasks[selected]?.find(x=>x.id===editing);
    if (before) state.tasks[selected]=state.tasks[selected].filter(x=>x.id!==before.id);
    (state.tasks[destination]??=[]).push({id:before?.id??uid(),title,time:values.get("time"),done:before?.done??false});
    editing="";
    if (destination!==selected) notice("Moved to "+dayLabel.format(date(destination))+".");
  } else if (kind==="movie") state.movies.push({id:uid(),title,done:false,spooky:values.has("spooky")});
  else if (id) state.habits.find(x=>x.id===id).title=title;
  else state.habits.push({id:uid(),title,hidden:false});
  save(); render();
  if (kind==="habit" && id) $("details").open=true;
});
window.addEventListener("hashchange",()=>{
  if (["#content","#day-plan"].includes(location.hash)) return;
  if (location.hash==="#chores") { $("#daily-chores")?.focus(); return; }
  importCandidate=null; render();
  if (jumpToChores&&page()==="planner") { jumpToChores=false; $("#daily-chores").focus(); return; }
  if (page()==="advent"&&chosenDoor) { $("#door-details").focus(); return; }
  window.scrollTo(0,0); main.focus({preventScroll:true});
});
loadTrack(); showEntry(entryDate); timerRender(); render();
if (storageIssue) notice("The browser couldn't read its saved progress.");

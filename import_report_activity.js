const db = require('./src/db/neonClient');

const rawData = `ID	Name	BRANCH	Cleaned Program	Cleaned Class	Level	Speaking Project to Next Level
20	Nicholas Matthew Halim		Junior/Youth Program	Einstein (Sat 1-3)	Sergeant	0%
21	Novriciella Carina Luthan	TIMOR	Junior/Youth Program	Dale (Sat 4-6)		
22	Candice Chrystalline Liangrich	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Sergeant	
23	Jivaka Putra		Junior/Youth Program	Confidence Class D3		
24	No registration					
25	Erich Legolas Cen		Junior/Youth Program	Waiting List		
26	Bryan Legolas Cen		Junior/Youth Program	Confidence Class D3		
27	Valerie Legolas Cen	CEMARA	Junior/Youth Program	Obsidian	Sergeant	80%
28	Raynard Fausta	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	General	
30	Chris Yochanan Wu	CEMARA	Junior/Youth Program	Obsidian	Lt. Colonel	0%
31	Hans Sozo Wu	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Lt. Colonel	50%
32	Jacqueline Tjia	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Private	
33	Candise Natalie	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)		
34	Megan Pindian	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)		
35	Jesslyn Odelia Thio	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)		
36	Giselle Titania	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)		
37	Keona Jane Viriya	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Lt. Colonel	
38	Jave Liong	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)		
39	Ryanne Shiven		Junior/Youth Program	Confidence  Class A5		
40	Jesaya Tara	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Private	
41	Clement Sanusi	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Private	
42	Aaron Sebastian Willson		Junior/Youth Program	Einstein (Sat 1-3)	Lt. Colonel	
43	Petra Zoe Khoman	TIMOR	Junior/Youth Program	Spielberg (Sat 4-6)	General	
44	Stella Edlyn Kwok	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	Lt. General	0%
45	Aaron Goldwin Semarak	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	General	
46	Marco Freddie Tjiaren	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	Colonel	0%
47	Martin Leandro Limero	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	Colonel	0%
48	Justin Maxwell	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	General	
49	Richmond Osyan Sudilan	TIMOR	Junior/Youth Program	Spielberg (Sat 4-6)	General	
50	Kenichi Zhou	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Lt. Colonel	0%
51	Cedric Yago	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	General	
52	Cheryl	TIMOR	Junior/Youth Program	Ziglar (Sat 4-6)	Sergeant	
53	Arilynn Wijaya	TIMOR	Junior/Youth Program	Ziglar (Sat 4-6)	Sergeant	
54	Grisvian Tandy		Junior/Youth Program		General	
55	Justin Rusly	TIMOR	Junior/Youth Program	Ziglar (Sat 4-6)	Sergeant	
56	Filbert		Junior/Youth Program			
57	Averina Liv Valerie Moiras	TIMOR	Junior/Youth Program	Spielberg (Sat 4-6)	General	
58	Brentnico Chen	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Sergeant	
59	Raynald Yu	TIMOR	Junior/Youth Program	Spielberg (Sat 4-6)	Lt. Colonel	
60	Sharleen Velicia Lim	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	General	
61	Kenneth Aurelio Bustamin	TIMOR	Junior/Youth Program	Ziglar (Sat 4-6)	Lt. Colonel	
62	Stephanie Ivana Salim	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Private	
63	Cleona Vivienne Lim	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	General	
64	Jillian Rusly	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	Colonel	0%
65	Gelsey Megan Chaniya	TIMOR	Junior/Youth Program	Spielberg (Sat 4-6)	Lt. General	90%
66	Ivaldo Juanda	TIMOR	Junior/Youth Program	Spielberg (Sat 4-6)	General	
67	Claryce Annabelle Yu	TIMOR	Junior/Youth Program	Spielberg (Sat 4-6)	General	
68	Othniel Rolando Manson	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Colonel	70%
69	Vivian Khu	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Private	
70	Selly Salim	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Private	
71	Amanda Gracie Onggo		Junior/Youth Program			
72	Kimberly Howanta	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Sergeant	
73	Jason Marco		Junior/Youth Program			
74	Ariel Lucius		Junior/Youth Program			
75	Paul Simanjuntak		Junior/Youth Program			
76	Michael Cahyadi	TIMOR	Junior/Youth Program	Ziglar (Sat 4-6)		
77	Valerie Doreen Kwerier	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	Sergeant	80%
78	Valerie Ann	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Sergeant	70%
79	Madeleine Lee	TIMOR	Junior/Youth Program	Tracy (Sat 4-6)	Sergeant	20%
80	Neo Freddiego Chen	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	Sergeant	
81	No registration					
82	Nicole Mila Khoman	TIMOR	Junior/Youth Program	Dale (Sat 4-6)	Sergeant	
83	Nicholas Siregar		Junior/Youth Program	Batari (Mon 15.30-17.30)		
84	Naomi Siregar		Junior/Youth Program	Batari (Mon 15.30-17.30)		
85	Shafira Gladys		Junior/Youth Program	Batari (Mon 15.30-17.30)		
86	Elysia Pasaribu		Junior/Youth Program			
87	Ellyse Sigalingging		Junior/Youth Program			
88	Nehemia Asadika Tumogihon Saragih		Junior/Youth Program			
89	Chelsea Grace Cantika Pasaribu		Junior/Youth Program			
90	Kayla Udrey		Junior/Youth Program	Batari (Mon 15.30-17.30)		
91	Dave Meliala		Junior/Youth Program			
92	Carissa Meliala		Junior/Youth Program			
93	No registration					
94	Flint Oliver		Junior/Youth Program	Apprentice (Sat 10.00-11.30)		
95	Wilbert Hartianto	TIMOR	Junior/Youth Program	Robbins (Sat 1-3)	Private	
96	Hudson Fulviano Sentosa	TIMOR	Junior/Youth Program	Spielberg (Sat 4-6)	General	
309	Luiz Alvaro Diego	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	Colonel	10%
331	Vellica Benarissa Tanjaya	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Private	
339	Ellen Angelica	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Lt. Colonel	20%
29	Muhammad Athallah Rafif Ulhaq	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	Lt. Colonel	90%
125	Jayxen Maxwell	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Colonel	30%
128	Felice Naomi Tjiaren		Junior/Youth Program	Einstein (Sat 1-3)	Sergeant	20%
126	Ellwed Layrence		Junior/Youth Program	Confidence Class C4		
127	Stefan Song		Junior/Youth Program	Confidence Class A6		
132	Morris Claudius	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Sergeant	
129	Suci Nurhaliza	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Private	
130	Anastasya Sofie Yohan	TIMOR	Junior/Youth Program	Spielberg (Sat 4-6)	Colonel	
133	Oedia Ruth Vania	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Colonel	0%
134	Madeline Lim	TIMOR	Junior/Youth Program	Dale (Sat 4-6)		
135	Celine Meganz Wijaya	TIMOR	Junior/Youth Program	Dale (Sat 4-6)	Sergeant	
136	Claudine Joshanley	TIMOR	Junior/Youth Program	Graham	Lt. Colonel	0%
137	Jovian Livio	TIMOR	Junior/Youth Program	Spielberg (Sat 4-6)	Lt. Colonel	40%
140	Walfred Aurelio Wijaya		Junior/Youth Program	Confidence  Class A5		
141	Russell William Tanner	TIMOR	Junior/Youth Program	DaVinci	Colonel	0%
139	Johnson Tanako	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Private	
138	Bryan Frederick Wijaya		Junior/Youth Program	waiting list		
144	Reagan Maxzen Kanawa		Junior/Youth Program	Marley (Fri 3-5)	Sergeant	
147	Jovianne Christa Xie	TIMOR	Junior/Youth Program	Tracy (Sat 4-6)	Sergeant	
145	Josh Brian Setiawan	TIMOR	Junior/Youth Program	Ziglar (Sat 4-6)	Private	
146	Raymand Wilbert Wijaya		Junior/Youth Program	waiting list		
148	Bryan Velerian	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Private	
149	Elaine Velicia	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Lt. Colonel	80%
151	Kenshiro Leowardy		Junior/Youth Program	Einstein (Sat 1-3)	Lt. Colonel	30%
152	Welton Padmoasmolo	TIMOR	Junior/Youth Program	Ziglar (Sat 4-6)	Lt. General	90%
290	Daniel Maranello Winata Winata		Junior/Youth Program	Marley (Fri 3-5)	Private	
234	Jacky Wu	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Private	
236	Calvin Wijaya		Junior/Youth Program	Apprentice (Sat 10.00-11.30)		
238	Venesya Evelyn Tiawan	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Private	
239	Shania Josevine	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Private	
240	Ricko Wu	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Private	
241	Revandeiss Putrameka Beruh		Junior/Youth Program	Marley (Fri 3-5)		
246	Brianne Antoniette Wibowo		Junior/Youth Program	Apprentice (Sat 10.00-11.30)		
247	Bernice Annabelle Wibowo		Junior/Youth Program	Marley (Fri 3-5)	Private	
248	Jayden Matthew Joe		Junior/Youth Program	Apprentice (Sat 10.00-11.30)		
249	Emily Santo	CEMARA	Junior/Youth Program	Jade	Sergeant	30%
250	Ryan Eagan Cendana	TIMOR	Junior/Youth Program	Spielberg (Sat 4-6)	Lt. Colonel	40%
261	No registration					
266	Felicia Tjiawijaya	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Private	
272	Jocelyn Basirun	TIMOR	Junior/Youth Program	Dale (Sat 4-6)	Sergeant	0%
273	Joy Tan	TIMOR	Junior/Youth Program	Tracy (Sat 4-6)	Private	
274	Candice Winardi Wong	TIMOR	Junior/Youth Program	Spielberg (Sat 4-6)	Colonel	0%
275	Eugenia Joanne Kie		Junior/Youth Program	Marley (Fri 3-5)	Private	100%
276	Florencia Oria		Junior/Youth Program	Marley (Fri 3-5)	Sergeant	
410	Dyra Muntazsirah	TIMOR	Junior/Youth Program	Sigmund	Colonel	0%
286	Jocelyn Oria	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Sergeant	
287	Starlin Oria		Junior/Youth Program	Maxwell (Fri 3-5)	Sergeant	
288	Carisle Vee Lovel	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Colonel	0%
291	Darrell Richard Sen	TIMOR	Junior/Youth Program	Gladwell	Sergeant	30%
292	Dylan Raynald Sen	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Sergeant	
293	Felice Meganz Wijaya	TIMOR	Junior/Youth Program	Gates (Sat 10-12)		
302	Eduardo Bingei	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Private	10%
303	Lucas Zhang	TIMOR	Junior/Youth Program	Gladwell	Lt. Colonel	0%
304	Louis Zhang		Junior/Youth Program	Einstein (Sat 1-3)	Lt. Colonel	10%
306	Rowen Reynaldo	TIMOR	Junior/Youth Program	Robbins (Sat 1-3)		
308	Nicholas Yanwar		Junior/Youth Program	Einstein (Sat 1-3)	Sergeant	
310	Warren Voss Khoman		Junior/Youth Program	Einstein (Sat 1-3)	Lt. Colonel	
318	Ellena Jocelyn Lasiman	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Lt. Colonel	90%
320	Andrene Metta Leo	TIMOR	Junior/Youth Program	Spielberg (Sat 4-6)	Colonel	0%
321	Devan Angkasa	TIMOR	Junior/Youth Program	Spielberg (Sat 4-6)	Lt. Colonel	
322	Eagan Hsiao	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Sergeant	
324	Yujiro Cokro	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Sergeant	
328	Jessica Evangeli Tjiawijaya	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Private	
329	Vrederick Benaricco Tanjaya	CEMARA	Junior/Youth Program	Sapphire	Colonel	0%
330	Avril Valerie Tjhe	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Sergeant	0%
332	Carlisse Anastacia Liang		Junior/Youth Program		Sergeant	30%
333	Jasmine Yenarti	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	General	
334	Milliana Joan		Junior/Youth Program	Batari (Wed 14.30-16.00)		
335	Kathleen Maria Isabel Sagala		Junior/Youth Program	Batari (Mon 15.30-17.00)		
342	Louiselynn Nurimba	TIMOR	Junior/Youth Program	Spielberg (Sat 4-6)	Lt. Colonel	50%
368	Felice Vallerie Angkasa	CEMARA	Junior/Youth Program	Obsidian	Colonel	0%
374	Clarice Aurelia Fuwynn	CEMARA	Junior/Youth Program	Ruby	Sergeant	
380	Valerie Jeanne Mandera		Junior/Youth Program	Marley (Fri 3-5)	Private	
390	Maximilian Evan Tanujaya	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Private	
393	Jelysha Soekendar	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Private	
394	Jemiko Soekendar	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Private	
395	Maverick Winata	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Private	
396	Matthew Candiof	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Sergeant	30%
398	Elbert Reagan Tevix	TIMOR	Junior/Youth Program	Gladwell	Sergeant	10%
399	Shannon Calista Tevix	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Sergeant	10%
400	Richard Axel Tjhe	TIMOR	Junior/Youth Program	Mandela	Sergeant	70%
405	Graciella Madeline	TIMOR	Junior/Youth Program	Robbins (Sat 1-3)	Private	88%
433	James Oliver Neoman	TIMOR	Junior/Youth Program	Gates (Sat 10-12)	Private	100%
438	Brielle Xaviera		Junior/Youth Program	Apprentice (Sat 10.00-11.30)		
440	Sofia Grace Wu	TIMOR	Junior/Youth Program	Gladwell	Colonel	0%
441	Kenzie Fernando Hugh	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	Colonel	0%
491	Audrey Theona Law	TIMOR	Junior/Youth Program	Tracy (Sat 4-6)	Private	
499	Halisna Ronauli Sinaga		Junior/Youth Program	Batari (Wed 14.30-16.00)		
511	Amarissa		Junior/Youth Program	Batari (Wed 14.30-16.00)		
512	Fione		Junior/Youth Program	Batari (Wed 14.30-16.00)		
513	Anabell	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Private	13%
517	Jack Travis Lee	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Private	100%
518	Joe Jasper Lee	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Private	100%
519	Valencia Wibowo	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Sergeant	100%
520	Falen Novelie	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Private	50%
521	Taryn Tjan	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Colonel	50%
525	 		Junior/Youth Program	Apprentice (Sat 10.00-11.30)		
528	Kiery Keionna Kie	TIMOR	Junior/Youth Program	Robbins (Sat 1-3)	Lt. Colonel	30%
529	Rodrique Owen Salim	TIMOR	Junior/Youth Program	Robbins (Sat 1-3)	Private	50%
530	Lewellyn Chen	TIMOR	Junior/Youth Program	Mandela	Private	
531	Max Chen	CEMARA	Junior/Youth Program	Sapphire	Sergeant	70%
532	Yasmin Fadhila Azzakiyah	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	Lt. Colonel	50%
533	Iffah Nabila Rahmad	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Private	50%
534	Izzatun Nada Azzakiyah	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Sergeant	50%
535	Harbert Ivander	TIMOR	Junior/Youth Program	Gladwell	Lt. Colonel	30%
536	Sky Alexander Kwan		Junior/Youth Program	Einstein (Sat 1-3)	Sergeant	0%
537	Sunshine Angelia Kwan		Junior/Youth Program	Einstein (Sat 1-3)	Sergeant	0%
538	Graciella Madeline	TIMOR	Junior/Youth Program	Robbins (Sat 1-3)	Private	
539	Giselle Ng	TIMOR	Junior/Youth Program	Tracy (Sat 4-6)	Colonel	20%
540	Valencia -	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Private	38%
541	Enzo Aldridge Teh		Junior/Youth Program	Marley (Fri 3-5)	Private	100%
542	Lionel Aston Wang	TIMOR	Junior/Youth Program	Neverland		
543	Stacey Carina Lim	TIMOR	Junior/Youth Program	Robbins (Sat 1-3)	Lt. Colonel	0%
544	Jolyn Yuvina	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Private	38%
545	Brandon Chiang	TIMOR	Junior/Youth Program	Sigmund	Lt. General	0%
546	Adelynne	TIMOR	Junior/Youth Program	Ziglar (Sat 4-6)	Sergeant	50%
237	Madeleiene Gelwaz	TIMOR	Junior/Youth Program	Gladwell	Private	
255	Denzel Geraldo Wijaya	CEMARA	Junior/Youth Program	Alexandrite	Sergeant	90%
267	Darren Gerrard	TIMOR	Junior/Youth Program	Robbins (Sat 1-3)	Sergeant	70%
268	Freya Anastasia Chendry	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Lt. Colonel	0%
269	Fresia Victoria Chendry	TIMOR	Junior/Youth Program	Sigmund	Lt. General	0%
270	Bonfilio Timothy Kosma	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Sergeant	
271	Christopher Aaron Imanuel Indrawan	TIMOR	Junior/Youth Program	Tracy (Sat 4-6)	Private	
280	Dylan Huang	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Sergeant	40%
283	Callista Abigail Suryawijaya Suryawijaya	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Sergeant	70%
284	Callysta Harly Huang	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Sergeant	
285	Clairine Joshanley	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Colonel	0%
289	Celine Valeri Hakim	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Sergeant	60%
294	Katherine Argerikh Winata Winata	TIMOR	Junior/Youth Program	Sigmund	Sergeant	70%
295	Liv Agatha Jolie	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Lt. Colonel	80%
301	Chloe Zhou	TIMOR	Junior/Youth Program	Spielberg (Sat 4-6)	Lt. Colonel	90%
307	Josh Derrick Phen	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	General	
336	Jose Keiyabes Sagala		Junior/Youth Program	Batari (Mon 15.30-17.00)		
341	Matt Stanley Chua	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Sergeant	40%
375	Darren Gabriel	CEMARA	Junior/Youth Program	Ruby	Colonel	90%
376	Elainne Callista Miracle	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Private	
377	Jason Clein Halim	TIMOR	Junior/Youth Program	Gladwell	Private	
378	Samuel Ancillo Miracle	TIMOR	Junior/Youth Program	Gladwell	Private	
379	Cathelyn Basirun	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Private	
381	Fiorentino Lee	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	Sergeant	10%
391	Aurelia Caitlyn Tanujaya	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Private	
418	Aristo Wiley	TIMOR	Junior/Youth Program	Dale (Sat 4-6)	Lt. Colonel	70%
423	Felysse Auryn Khobert	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	Sergeant	60%
425	Kentrick		Junior/Youth Program		Private	100%
426	Selby Cen	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Sergeant	10%
429	Charrelle Anthony	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	General	
431	Justine Limurti	TIMOR	Junior/Youth Program	Dale (Sat 4-6)	Private	38%
435	Alvendi Tanio	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Private	
436	Braven Suryadi	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Private	
437	Sheldon Suryadi		Junior/Youth Program	Einstein (Sat 1-3)	Private	
442	Beatrys Vanesa Moiras	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Lt. General	
443	Candyce Valezka Moiras	TIMOR	Junior/Youth Program	Spielberg (Sat 4-6)	Lt. General	90%
445	Sherlyn Mireil	TIMOR	Junior/Youth Program	Mandela	Lt. Colonel	20%
446	Victoria Juhana	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Lt. Colonel	0%
472	Stuart Tjuatja	TIMOR	Junior/Youth Program	DaVinci	Lt. Colonel	50%
475	Jacinda Viorenza Valentina	TIMOR	Junior/Youth Program	Graham	Lt. Colonel	80%
476	Justin Rich Limilo	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Sergeant	60%
477	Jovetta Kiyomi Limilo	TIMOR	Junior/Youth Program	Graham	Sergeant	80%
478	Gracelyn Lawrence	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Sergeant	90%
479	James Brian Fan	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Private	40%
480	Jennice	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Sergeant	10%
482	Reizo Kazuo Wong	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Colonel	90%
483	Jolie Charlotte Huang	CEMARA	Junior/Youth Program	Topaz	Lt. General	0%
484	Arcelio Winston Laurence	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Sergeant	60%
485	Grace Ignasia Batubara	TIMOR	Junior/Youth Program	Dale (Sat 4-6)	Private	
486	Nakin Ben Cuseline	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Private	100%
487	Edward Putra Limtama		Junior/Youth Program	Einstein (Sat 1-3)	Private	
488	Khansa Tabita Sakhi	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	Sergeant	50%
490	Shane Ferrucio Lim	CEMARA	Junior/Youth Program	Alexandrite	Lt. Colonel	80%
493	Davian Anders	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Lt. Colonel	50%
494	Arsene Eldwen	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Sergeant	0%
495	Celine Manuela Aritonang		Junior/Youth Program	Batari (Wed 14.30-16.00)		
497	Joyceline Fidella Aquinamora Marpaung		Junior/Youth Program	Batari (Wed 14.30-16.00)		
498	Jordan Alexander Lim	CEMARA	Junior/Youth Program	Alexandrite	Sergeant	90%
501	Jocelyn Chloe Chandra	TIMOR	Junior/Youth Program	Neverland		
503	Wayne Lincoln Tansley	TIMOR	Junior/Youth Program	Gladwell	Sergeant	60%
504	Wyatt Benjamin Tansley		Junior/Youth Program	Einstein (Sat 1-3)	Sergeant	100%
506	Clarabella	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Sergeant	80%
507	Abelvinco	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	Lt. Colonel	90%
508	Aldin Roi Angkasa	TIMOR	Junior/Youth Program	Tracy (Sat 4-6)	Private	100%
547	Winson Natio		Junior/Youth Program		Sergeant	
548	Fiona Candiof	TIMOR	Junior/Youth Program	Spielberg (Sat 4-6)	Lt. Colonel	0%
549	Clairine Kimberly	TIMOR	Junior/Youth Program	Neverland		
550	Vania Keinarra Handoko	TIMOR	Junior/Youth Program	Wonderland		
551	Ryuichiro Leowardy		Junior/Youth Program	Apprentice (Sat 10.00-11.30)		
552	Brian Lim	TIMOR	Junior/Youth Program	Tracy (Sat 4-6)	Private	25%
553	Florencia Hewi	TIMOR	Junior/Youth Program	Mandela	Lt. Colonel	90%
554	Brendi Lim	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Private	13%
555	No registration					
556	Lewis Darren Huang	TIMOR	Junior/Youth Program	Sigmund	Sergeant	80%
557	Richelle Erica Luhur		Junior/Youth Program			
558	Alysa Roberta Luhur		Junior/Youth Program			
559	Quinetta Pearl		Junior/Youth Program	Marley (Fri 3-5)	Private	50%
560	Ruiz Stythan	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Lt. Colonel	80%
561	No registration					
562	No registration					
563	Fellicia Lawrence	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Private	100%
564	No registration					
565	No registration					
566	Jollyn Felicia Wong	TIMOR	Junior/Youth Program	Spielberg (Sat 4-6)	Colonel	0%
567	Benediva Boaz Ambarita		Junior/Youth Program			
568	Carlista	TIMOR	Junior/Youth Program	Spielberg (Sat 4-6)	Colonel	0%
569	Josevin Carel H.	TIMOR	Junior/Youth Program	Sigmund	Lt. Colonel	0%
570	Cherish Daniella Lee		Junior/Youth Program	Private Mentoring		
571	Aurelle Sophie Kesuma	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Lt. Colonel	20%
572	No registration					
573	Alvaro Richie Theus	TIMOR	Junior/Youth Program	Spielberg (Sat 4-6)	General	
574	Brandon Tiojaya	TIMOR	Junior/Youth Program	Mandela	Colonel	10%
575	Mandy Ellen Sanusi	TIMOR	Junior/Youth Program	DaVinci	Lt. General	0%
576	Joanne Wong	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Private	50%
577	Jovanna Wong	TIMOR	Junior/Youth Program	Ziglar (Sat 4-6)	Private	75%
578	Marvel William	TIMOR	Junior/Youth Program	Dale (Sat 4-6)	Private	13%
579	Wilbert Tanaya	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Private	50%
580	Vivienne Zheng	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	General	
581	Nicholas Zheng	TIMOR	Junior/Youth Program	Spielberg (Sat 4-6)	Lt. General	0%
582	Ethan Aldrich Lie	TIMOR	Junior/Youth Program	Gandhi	Lt. Colonel	0%
583	Yuvrelyn Edren Yie	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Lt. Colonel	0%
584	Ivann Raphael Ohary	CEMARA	Junior/Youth Program	Obsidian	Sergeant	70%
585	Harvey Wijaya	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Colonel	0%
586	Annabella Wijaya	TIMOR	Junior/Youth Program	Mandela	Colonel	0%
587	Enrico Victorian	CEMARA	Junior/Youth Program	Pearl	Colonel	30%
588	Vallerent Viquel	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Colonel	0%
589	Aisyah Farah Setia Ixora	TIMOR	Junior/Youth Program	Gates (Sat 10-12)	Sergeant	20%
590	Zadden Tanaya	TIMOR	Junior/Youth Program	Gladwell	Private	75%
591	Joyce Mirabel Ng		Junior/Youth Program	Marley (Fri 3-5)	Private	63%
592	Marcelys Salim	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Lt. Colonel	0%
593	Houdrick Angelico	TIMOR	Junior/Youth Program	Ziglar (Sat 4-6)	Sergeant	30%
594	Harleen Angelic	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Sergeant	80%
595	Kathryn Jeslyn	TIMOR	Junior/Youth Program	Sigmund	Lt. Colonel	50%
596	Nevaeh Ferry	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Private	25%
597	Stuart Hayden Tay	TIMOR	Junior/Youth Program	Gates (Sat 10-12)	Private	100%
598	Mario Aretha Ui	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Sergeant	30%
599	Nadya Aretha Ui	TIMOR	Junior/Youth Program	Robbins (Sat 1-3)	Sergeant	10%
600	Gyan Lucero Joenardi	CEMARA	Junior/Youth Program	Ruby	Colonel	0%
601	Mikaella Hutteleigh Ng	TIMOR	Junior/Youth Program	Robbins (Sat 1-3)	Colonel	70%
602	Alexandra Joan Micheline	CEMARA	Junior/Youth Program	Jade	Colonel	20%
603	Max Viandi	TIMOR	Junior/Youth Program	Gates (Sat 10-12)	Lt. Colonel	60%
604	Hugo Viandi	TIMOR	Junior/Youth Program	Robbins (Sat 1-3)	Lt. Colonel	0%
605	Philbert Charlin	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Private	13%
606	Stella Fredella Teoh		Junior/Youth Program	Marley (Fri 3-5)	Sergeant	10%
607	Gilbert Charlin	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Private	25%
608	Ava Katarina Tjhe	TIMOR	Junior/Youth Program	Robbins (Sat 1-3)	Sergeant	10%
609	Rebecca Xie	TIMOR	Junior/Youth Program	Gates (Sat 10-12)	Sergeant	90%
610	Josh Frederric Ang	TIMOR	Junior/Youth Program	Newton (Tue 4-6)	Sergeant	40%
611	No registration					
612	Madelyn Chloe Wong	CEMARA	Junior/Youth Program	Amber	Lt. Colonel	40%
613	Junior Auson Halim	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Lt. Colonel	50%
614	Rayden Chiang	TIMOR	Junior/Youth Program	DaVinci	Colonel	10%
615	Louis Anthony Shen	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Private	63%
616	Sean Bryant Wong	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Private	50%
617	Channelle Kimberley Wong	TIMOR	Junior/Youth Program	Gladwell	Private	25%
618	Yamin Yenardo	TIMOR	Junior/Youth Program	DaVinci	Colonel	60%
619	Gilbert	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Private	50%
620	Sierra Conrad		Junior/Youth Program	Apprentice (Sat 10.00-11.30)		
621	Ufaira Tiandra Dalimunthe	TIMOR	Junior/Youth Program	Gates (Sat 10-12)	Lt. Colonel	0%
622	Zahra Ghaniyah	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Sergeant	100%
623	Angelina Setyawan	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Lt. Colonel	0%
624	Michael Setyawan	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Lt. Colonel	40%
625	Audrey Hartono Lee	TIMOR	Junior/Youth Program	Graham	Private	63%
626	Alawi Ali Zumaini	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Sergeant	60%
627	Vin Maxwell	TIMOR	Junior/Youth Program	Robbins (Sat 1-3)	Private	63%
628	Heidi Mikaela Tenggara	TIMOR	Junior/Youth Program	Neverland		
629	Joey Frederica Ang	TIMOR	Junior/Youth Program	Graham	Private	50%
630	Nichole Gabrielle Santoso	TIMOR	Junior/Youth Program	Gates (Sat 10-12)	Sergeant	30%
631	Queency Joycelyn Yieginia	TIMOR	Junior/Youth Program	Gladwell	Lt. Colonel	80%
632	Clarisa Valencia Khomala	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	General	
633	Fiona Jolys Chong	TIMOR	Junior/Youth Program	Gates (Sat 10-12)	Colonel	0%
634	Glory Esther Simanjuntak	TIMOR	Junior/Youth Program	Neverland		
635	Hillary Kayra Orsontio	TIMOR	Junior/Youth Program	Gandhi	Private	38%
636	Zia Arafa Khairina	TIMOR	Junior/Youth Program	Gates (Sat 10-12)	Lt. Colonel	90%
637	Celine Cheng	CEMARA	Junior/Youth Program	Alexandrite	Sergeant	70%
638	Chloe Olivia Ruslie	CEMARA	Junior/Youth Program	Alexandrite	Lt. Colonel	70%
639	Bianca Olivia Ruslie	CEMARA	Junior/Youth Program	Alexandrite	Sergeant	100%
640	Amelia Laurence	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Private	50%
641	Emily Audrie Pannata	TIMOR	Junior/Youth Program	Neverland		
642	Feligio Beatryan Wijaya	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Private	63%
643	Bilson Nobleyu	TIMOR	Junior/Youth Program	Wonderland		
644	Marson Nobleyu	TIMOR	Junior/Youth Program	Robbins (Sat 1-3)	Private	75%
645	Marsha Ava Kaylana	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Colonel	0%
646	Felivia Riandy	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Lt. General	
647	Celine Hadian	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Private	75%
648	Sarah		Junior/Youth Program			
649	Geraldine Caitriona Saimen	TIMOR	Junior/Youth Program	Wonderland		
650	Quintus Aurelio Tjhe	TIMOR	Junior/Youth Program	Robbins (Sat 1-3)	Private	50%
651	Ashley Claire Lorence	TIMOR	Junior/Youth Program	Graham	Private	63%
652	Michelle Budiman	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Sergeant	20%
653	Jermaine Eldwen	TIMOR	Junior/Youth Program	Gladwell	Private	100%
654	Rayden Oh	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Lt. Colonel	50%
655	Euan Benson Pranoto	TIMOR	Junior/Youth Program	Wonderland		
656	No registration					
657	No registration					
658	Hugh Rhys Holiverz	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Private	50%
659	Kimberlyn Alexis Holiverz		Junior/Youth Program	Einstein (Sat 1-3)	Private	38%
660	No registration					
661	Alexa Ellane	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Lt. Colonel	0%
662	Clayton Komar Kok	TIMOR	Junior/Youth Program	Dale (Sat 4-6)	Private	50%
663	Jacqueline Simpson	TIMOR	Junior/Youth Program	Mandela	Private	63%
664	Chloe Valerie	TIMOR	Junior/Youth Program	Graham	Private	50%
665	Khoo Shu Han	TIMOR	Junior/Youth Program	Spielberg (Sat 4-6)	Lt. Colonel	60%
666	Khoo Kwang Wei	TIMOR	Junior/Youth Program	Robbins (Sat 1-3)	Sergeant	50%
667	Khoo Kwang Chen	TIMOR	Junior/Youth Program	Dale (Sat 4-6)	Private	63%
668	Richelle Shiven	TIMOR	Junior/Youth Program	Wonderland		
669	Veraldo Valentino Rusli	TIMOR	Junior/Youth Program	Tracy (Sat 4-6)	Private	63%
670	Christian Anderson Lee	TIMOR	Junior/Youth Program	Newton (Tue 4-6)	Lt. Colonel	0%
671	Chloe Bernice Tan	TIMOR	Junior/Youth Program	Newton (Tue 4-6)	Sergeant	20%
672	Arissa Wijaya	TIMOR	Junior/Youth Program	Gandhi	Private	50%
673	Nathan Immanuel Winanto	TRITURA	Junior/Youth Program	Denver	Sergeant	80%
674	Lorabelle Leon	TIMOR	Junior/Youth Program	Gandhi	Private	50%
675	Maxen Zo Leon	TIMOR	Junior/Youth Program	Gates (Sat 10-12)	Lt. Colonel	90%
676	Grace Alexandra	TIMOR	Junior/Youth Program	Galileo (Wed 4-6)	Colonel	10%
677	Olivia Florence Loesin	TIMOR	Junior/Youth Program	Aristotle	Sergeant	30%
678	Zoey Fiona Loesin	TIMOR	Junior/Youth Program	Wonderland		
679	Fiorenza Eleanor Wijaya	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	Colonel	30%
680	Gracelyn Yap	TIMOR	Junior/Youth Program	Galileo (Wed 4-6)	Lt. General	90%
681	Vanessa Sonata	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	General	
682	Jocelyn Ryu Kaylee	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Lt. Colonel	20%
683	Stanley Ace Lorence	TIMOR	Junior/Youth Program	Tracy (Sat 4-6)	Colonel	0%
684	Chayden Yavier Chu	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Sergeant	90%
685	Cherlyn Yaviera Chu	TIMOR	Junior/Youth Program	Mandela	Private	75%
686	Owen Linwood	TIMOR	Junior/Youth Program	Tracy (Sat 4-6)	Lt. Colonel	40%
687	Philipp Torrien Chandra		Junior/Youth Program		Private	100%
688	Evelynn Belle Wunanda	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Private	38%
689	Russell Ang		Junior/Youth Program		Private	63%
690	Raynard Ang		Junior/Youth Program		Private	63%
691	Vanessa Claire Wunanda	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Private	20%
692	Alyssa Anne Wunanda	TIMOR	Junior/Youth Program	Gladwell	Private	75%
693	No registration					
694	No registration					
695	No registration					
696	No registration					
697	Ruby Lie	TIMOR	Junior/Youth Program	Gandhi	Private	63%
698	Jason Maverick Tan		Junior/Youth Program			
699	Audrey Pheng	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Sergeant	100%
700	Galen Lawden	TIMOR	Junior/Youth Program	Galileo (Wed 4-6)	Lt. Colonel	20%
701	Louisya Nistriora Manalu	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Lt. Colonel	0%
702	Rayzellvion Edren Yie	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Sergeant	80%
703	Stacy Kho	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Lt. Colonel	0%
704	Morgan Valentino Lowis	TIMOR	Junior/Youth Program	Gates (Sat 10-12)	Lt. Colonel	60%
705	Grace Vania Susanto	TIMOR	Junior/Youth Program	Galileo (Wed 4-6)	Private	50%
706	William Arthur Tjuatja	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Sergeant	0%
707	Samho Gunawan	TIMOR	Junior/Youth Program	Robbins (Sat 1-3)	Lt. Colonel	50%
708	Dixen Andersen	TIMOR	Junior/Youth Program	Galileo (Wed 4-6)	Lt. General	20%
709	Winston Lawrence	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Colonel	0%
710	Ethan Jae Ongko	TIMOR	Junior/Youth Program	Apprentice 4 (Sat 10-11.30)		
711	Leon Walter Zhu	TIMOR	Junior/Youth Program	Apprentice 4 (Sat 10-11.30)		
712	Ilona Freya Zhu	TIMOR	Junior/Youth Program	Apprentice 4 (Sat 10-11.30)		
713	Ferguson Gohardjo	TIMOR	Junior/Youth Program	Apprentice 4 (Sat 10-11.30)		
714	Delphine Adeline Bellinda	TIMOR	Junior/Youth Program	Galileo (Wed 4-6)	Private	38%
715	Ken Os Lim	TIMOR	Junior/Youth Program	Tracy (Sat 4-6)	Private	50%
716	Chloe Vallerie Jie	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Lt. Colonel	80%
717	Dmitri Meddef Njo	TIMOR	Junior/Youth Program	Sigmund	Sergeant	20%
718	Clara Glory Xie	TIMOR	Junior/Youth Program	Newton (Tue 4-6)	Sergeant	
719	Davar Aly Harahap	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	Colonel	0%
720	James Richley Qiu	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Sergeant	100%
721	Jarred Qiu	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Sergeant	100%
722	Enzo Witton	TIMOR	Junior/Youth Program	Dale (Sat 4-6)	Private	88%
723	Jolin Rochelle Chen	TIMOR	Junior/Youth Program	Galileo (Wed 4-6)	Private	63%
724	No registration					
725	No registration					
726	Renzo Tanaka	TIMOR	Junior/Youth Program	Graham	Lt. Colonel	0%
727	Edeline Wisely	TIMOR	Junior/Youth Program	Galileo (Wed 4-6)	Private	38%
728	Venagneisa Van Grinsven	TIMOR	Junior/Youth Program	Galileo (Wed 4-6)	Private	38%
729	Carissa Aurelia Wylie	TIMOR	Junior/Youth Program	Sigmund	Private	50%
730	Felice Edly Liauwin	TIMOR	Junior/Youth Program	Galileo (Wed 4-6)	Private	50%
731	Nicole Alicia Tan	TIMOR	Junior/Youth Program	Apprentice 4 (Sat 10-11.30)		
732	Edward Liu	TIMOR	Junior/Youth Program	Apprentice 4 (Sat 10-11.30)		
733	Anindya Iftitah Lubis	TIMOR	Junior/Youth Program	Mandela	Private	75%
734	Jillian Alessandra Tjhe	TIMOR	Junior/Youth Program	Apprentice 4 (Sat 10-11.30)		
735	Kenward Melvern Djohan	TIMOR	Junior/Youth Program	Gates (Sat 10-12)	Lt. Colonel	90%
736	Kendrick Melvern Djohan	TIMOR	Junior/Youth Program	Gates (Sat 10-12)	Lt. Colonel	70%
737	Zivanna Quenby Boey	TIMOR	Junior/Youth Program	Graham	Private	50%
738	Adeline Njo	TIMOR	Junior/Youth Program	DaVinci	Lt. Colonel	70%
739	Zoefiker Putera Ngadiman	TIMOR	Junior/Youth Program	Spielberg (Sat 4-6)	Lt. Colonel	40%
740	Aubree Lisman	TIMOR	Junior/Youth Program	Gandhi	Colonel	0%
741	Brayden Lisman	TIMOR	Junior/Youth Program	Galileo (Wed 4-6)	Colonel	50%
742	Zavelyn Marpauli	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Sergeant	0%
743	Nathanael Shawn Alexander	TIMOR	Junior/Youth Program	Tracy (Sat 4-6)	Lt. Colonel	40%
744	Vianne Renata Lim	TIMOR	Junior/Youth Program	Ziglar (Sat 4-6)	Private	63%
745	Jesslyn	TIMOR	Junior/Youth Program	Galileo (Wed 4-6)	General	0%
746	Jocelyn Leman	TIMOR	Junior/Youth Program	Sigmund	Private	25%
747	Jacklyn Feliska Hasan	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	Private	50%
748	No registration					
749	Jocelyn M Yasmine Parhusip	TIMOR	Junior/Youth Program	Hogwarts		
750	No registration					
751	Howie Chan	TIMOR	Junior/Youth Program	Tracy (Sat 4-6)	Colonel	0%
752	No registration					
753	Eugene Matthew		Junior/Youth Program		Sergeant	20%
754	Reagan Khei Subroto	TIMOR	Junior/Youth Program	Canfield	Lt. Colonel	0%
755	Sherly	TIMOR	Junior/Youth Program	Sigmund	Private	38%
756	Callista Sumono	TIMOR	Junior/Youth Program	Sigmund	Private	38%
757	Jeanice Madeleine Kwok	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Sergeant	20%
758	Sofia Lukman	TIMOR	Junior/Youth Program	Graham	Private	63%
759	Warren Emanuel	CEMARA	Junior/Youth Program	Ruby	Lt. Colonel	0%
760	Richard Zheng	TIMOR	Junior/Youth Program	DaVinci	Sergeant	100%
761	Richelle Zheng	TIMOR	Junior/Youth Program	Gandhi	Lt. Colonel	30%
762	Hogan Calixto Huang		Junior/Youth Program	Einstein (Sat 1-3)	Sergeant	40%
763	Safira Reynia Hanum	TIMOR	Junior/Youth Program	Lincoln	Private	100%
764	No registration					
765	No registration					
766	Frincelia Wijaya	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	Private	25%
767	Theodore Joachim Wihardjo	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Sergeant	50%
768	Josh Seravino Zhang	TIMOR	Junior/Youth Program	Gates (Sat 10-12)	Sergeant	70%
769	Joyce Yang	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Sergeant	20%
770	Emma Gozali	TIMOR	Junior/Youth Program	Dale (Sat 4-6)	Private	
771	Jileen Chen	TIMOR	Junior/Youth Program	Galileo (Wed 4-6)	Sergeant	0%
772	Joleen Chen	TIMOR	Junior/Youth Program	Galileo (Wed 4-6)	Private	50%
773	No registration					
774	No registration					
775	Clarissa Amberlyn	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Sergeant	100%
776	Eason Niklaus	TIMOR	Junior/Youth Program	Tracy (Sat 4-6)	Private	25%
777	Audrey Victoria Lim	CEMARA	Junior/Youth Program	Obsidian	Lt. Colonel	20%
778	Christian Beryl Sinuhaji	TIMOR	Junior/Youth Program	Hogwarts		
779	Jayden Tarmidi	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Lt. Colonel	10%
780	Steven Nicholas Halim	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	Private	50%
781	Savannah Zoe Wijaya	CEMARA	Junior/Youth Program	Amber	Lt. Colonel	0%
782	Hana Sophia Alice	TIMOR	Junior/Youth Program	Hogwarts		
783	Evelynn Lee	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Sergeant	0%
784	Garrix Ardent Putra	TIMOR	Junior/Youth Program	Lincoln	Private	100%
785	Kelly Alyse Tanary	TIMOR	Junior/Youth Program	Robbins (Sat 1-3)	Lt. Colonel	10%
786	Shelline Sutanto	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Private	38%
787	Shahnaz Shirendia	TIMOR	Junior/Youth Program	Robbins (Sat 1-3)	Private	50%
788	Mhd Farid Athallah Hasibuan	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Sergeant	0%
789	James T Chandra	TIMOR	Junior/Youth Program	Sigmund	Private	50%
790	Hardey Moeldoko Law	TIMOR	Junior/Youth Program	Gandhi	Sergeant	80%
791	Eduardo Xaviero Bingei	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Sergeant	60%
792	Hubert Bryan	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Lt. Colonel	80%
793	Grace Kelly	TIMOR	Junior/Youth Program	Mandela	Private	63%
794	Judyth Annabelle Naulibasa	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	Sergeant	0%
795	Avelynn Wijaya	TIMOR	Junior/Youth Program	DaVinci	Private	88%
796	Ashton Howie	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Colonel	60%
797	No registration					
798	No registration					
799	Meredith Adlian	TIMOR	Junior/Youth Program	Hogwarts		
800	Xavier Orlando Boe	TIMOR	Junior/Youth Program	Gladwell	Private	100%
801	Hillary Calista Tamado Panjaitan	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Colonel	90%
802	Arthur Kendrick Zhuang	TIMOR	Junior/Youth Program	Gandhi	Private	100%
803	Lovea Fendy Kho	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Lt. General	80%
804	Rebecca Iewanto Xu	TIMOR	Junior/Youth Program	Narnia		
805	Jevan Sean Vertio	CEMARA	Junior/Youth Program	Ruby	Sergeant	0%
806	Efrata Iskandar Liunardi	TIMOR	Junior/Youth Program	Lincoln	Private	88%
807	Tristan Jacob	TIMOR	Junior/Youth Program	Lincoln	Private	50%
808	Gareth Brilliant Lim	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Private	100%
809	Emilia Niko Nyoman	TIMOR	Junior/Youth Program	Lincoln	Private	63%
810	Jayden Tanadin	TIMOR	Junior/Youth Program	Lincoln	Private	
811	Arthur Floyd Salim	TIMOR	Junior/Youth Program	Lincoln	Private	100%
812	Lorenzo Margo Jap	TIMOR	Junior/Youth Program	Narnia		
813	Kimmy Tjanaka	TIMOR	Junior/Youth Program	DaVinci	Private	13%
814	Navarro Lim	TIMOR	Junior/Youth Program	Spielberg (Sat 4-6)	Colonel	0%
815	Alicia Oranie Depari	TIMOR	Junior/Youth Program	Galileo (Wed 4-6)	Lt. Colonel	0%
816	Victoria Alberta Zheng	TIMOR	Junior/Youth Program	Narnia		
817	Nicho Chandra Vimalanetra	CEMARA	Junior/Youth Program	Ruby	Sergeant	30%
818	Naomi Alexis Supangat	TIMOR	Junior/Youth Program	DaVinci	Private	63%
819	Maria Jill Lumbantoruan	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Lt. Colonel	60%
820	Alexander Alberta Zheng		Junior/Youth Program	Einstein (Sat 1-3)	Private	63%
821	Vallerio	TIMOR	Junior/Youth Program	Galileo (Wed 4-6)	Lt. General	20%
822	Clarissa Olivia Anne Lammora Panjaitan	TIMOR	Junior/Youth Program	Spielberg (Sat 4-6)	Colonel	10%
823	James Bryan Tantono	TIMOR	Junior/Youth Program	Hogwarts		
824	Septiana Katelyn Sharon Sinaga	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Private	88%
825	Grace Elizabeth	TIMOR	Junior/Youth Program	Ziglar (Sat 4-6)	Sergeant	40%
826	Darren Wilson	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Private	38%
827	Aldrich Reynard Atmadi	TIMOR	Junior/Youth Program	Tracy (Sat 4-6)	Sergeant	50%
828	Elvano Reynard Atmadi	TIMOR	Junior/Youth Program	Hogwarts		
829	Zhafir Gantari	TIMOR	Junior/Youth Program	Gandhi	Private	75%
830	Justin Junior	TIMOR	Junior/Youth Program	Wonderland		
831	Ryan Hugo Purnomo	TIMOR	Junior/Youth Program	Wonderland		
832	Allessandra J Lee	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	Private	63%
833	Quin Adrianna	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Private	88%
834	Mario Charlie		Junior/Youth Program	Einstein (Sat 1-3)	Private	100%
835	Finn Aldrich Luman	TIMOR	Junior/Youth Program	Lincoln	Private	63%
836	Kent Arthur Luman	TIMOR	Junior/Youth Program	Hogwarts		
837	Clairine Angela Indrajaya	TIMOR	Junior/Youth Program	Lincoln	Private	100%
838	Louis Harvey Soesanto	TIMOR	Junior/Youth Program	Wonderland		
839	Caitlyn Bianca Tjiaman	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Sergeant	30%
840	Cullen Brian Tjiaman	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Sergeant	30%
841	Jocelyn Jolie Tainiady	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Sergeant	30%
842	Ethan Moeritz	TIMOR	Junior/Youth Program	Mandela	Private	100%
843	Jenessa Effendy	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Sergeant	90%
844	Callista Stacy Lim	TIMOR	Junior/Youth Program	Dale (Sat 4-6)	Private	100%
845	Wallace Evencio	TIMOR	Junior/Youth Program	Newton (Tue 4-6)	Lt. Colonel	0%
846	Stevaldo Verino Oursun	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Private	88%
847	Claudia Catherine	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Private	50%
848	Ethan Fernandez Yap	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Sergeant	70%
849	Wilbert Limin	TIMOR	Junior/Youth Program	DaVinci	Sergeant	
850	Karin Destynsia	TIMOR	Junior/Youth Program	DaVinci	Colonel	0%
851	Tiffany Taniwan	TIMOR	Junior/Youth Program	Galileo (Wed 4-6)	Private	25%
852	Cellistia Cangdiago	TIMOR	Junior/Youth Program	Galileo (Wed 4-6)	Lt. General	50%
853	No registration					
854	Chiara Vallerie Jie	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Sergeant	60%
855	Cayden Louis Auwrich	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Sergeant	0%
856	Carissa Catherine	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	Private	63%
857	Hogan Chan	TIMOR	Junior/Youth Program	Tracy (Sat 4-6)	Lt. Colonel	70%
858	Delmond Osyan Sudilan	TIMOR	Junior/Youth Program	Mandela	Sergeant	0%
859	Clarissa Kho	TIMOR	Junior/Youth Program	Graham	Private	75%
860	Michelle Yap	CEMARA	Junior/Youth Program	Ruby	Sergeant	30%
861	Cyndi Ramaly		Junior/Youth Program		Lt. Colonel	0%
862	Calvin Ramaly		Junior/Youth Program		Lt. Colonel	20%
863	Bonita Gaudeti Sinaga	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Lt. Colonel	80%
864	No registration					
865	Victoria Yap	TIMOR	Junior/Youth Program	Tracy (Sat 4-6)	Lt. Colonel	80%
866	Carlsen Simen	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Sergeant	60%
867	Cherlyn Simen	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Sergeant	80%
868	Sergio Garcia Ang	CEMARA	Junior/Youth Program	Beryl	Lt. Colonel	80%
869	Fleurette Celestine Lee	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Sergeant	60%
870	Karen Hazel Liu	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Sergeant	0%
871	Ryant Anthoney Lim	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Sergeant	50%
872	Kenneth Samuel Lim	TIMOR	Junior/Youth Program	DaVinci	Lt. Colonel	90%
873	Ozil Ramadhan Hutasuhut	TIMOR	Junior/Youth Program	Tracy (Sat 4-6)	Private	50%
874	Muhammad Rafli Arkan	TIMOR	Junior/Youth Program	Graham	Sergeant	80%
875	Clarissa Fredelyn Jeoh	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Sergeant	0%
876	Jacqueline Vallerie Chen	CEMARA	Junior/Youth Program	Topaz	Lt. Colonel	10%
877	Jenica Zealand Feng	TIMOR	Junior/Youth Program	Gladwell	Private	38%
878	Bianca Maldiva Feng	TIMOR	Junior/Youth Program	Gladwell	Private	50%
879	Jolin Vander Cia	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Private	50%
880	Joel Edward	TIMOR	Junior/Youth Program	Gates (Sat 10-12)	Lt. Colonel	60%
881	No registration					
882	Justin Chen	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Private	50%
883	Joanne Lynch	TIMOR	Junior/Youth Program	Lincoln	Private	100%
884	Starley Valero Gozali	TIMOR	Junior/Youth Program	Galileo (Wed 4-6)	Private	38%
885	Skylar Valdesto Gozali	TIMOR	Junior/Youth Program	Galileo (Wed 4-6)	Private	38%
886	Jazzlyn Javeni	TIMOR	Junior/Youth Program	Hogwarts		
887	Filia Cielo Lim	TIMOR	Junior/Youth Program	DaVinci	Lt. Colonel	
888	Celine Chastine Angkasa	CEMARA	Junior/Youth Program	Amber	Sergeant	50%
889	Madelyn Odelia Lowis	TIMOR	Junior/Youth Program	Tracy (Sat 4-6)	Colonel	0%
890	Eunice Grace	CEMARA	Junior/Youth Program	Amber	Private	75%
891	Jayxvier Keegan Chuwardi	TIMOR	Junior/Youth Program	Hogwarts		
892	Edward Nursalim	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Private	63%
893	Prajna Nursalim	TIMOR	Junior/Youth Program	Newton (Tue 4-6)	Private	100%
894	Sudatta Nursalim	TIMOR	Junior/Youth Program	Tracy (Sat 4-6)	Private	20%
895	Michelle Angelina Yip	TIMOR	Junior/Youth Program	Gates (Sat 10-12)	Sergeant	100%
896	Nicolas Carlie Kuwira	TIMOR	Junior/Youth Program	Galileo (Wed 4-6)	Lt. General	80%
897	Valerie Ivana Chen	TIMOR	Junior/Youth Program	Gates (Sat 10-12)	Sergeant	80%
898	Ricson Stanlay	TIMOR	Junior/Youth Program	Neverland		
899	Jay Ven	CEMARA	Junior/Youth Program	Obsidian	Sergeant	60%
900	Nicole Carmen Chang	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Sergeant	30%
901	Elaine Velicia	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Private	
902	Malcolm	TIMOR	Junior/Youth Program	Gladwell	Sergeant	70%
903	Harvey Oliver Lee	TIMOR	Junior/Youth Program	Gladwell	Private	100%
904	Callista Aurelia Tasma	TIMOR	Junior/Youth Program	Galileo (Wed 4-6)	Colonel	50%
905	Carissa Aurelia Tasma	TIMOR	Junior/Youth Program	Galileo (Wed 4-6)	Private	50%
906	Dario Oscar Zhong	TIMOR	Junior/Youth Program	Wonderland		
907	Emma Valerie Pang	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Sergeant	100%
908	Averynn Marcia Pang	TIMOR	Junior/Youth Program	Accelerated Intensive 3 (Sat, 1-3)	Private	63%
909	Keona Jaileynn Lawrence	TIMOR	Junior/Youth Program	Robbins (Sat 1-3)	Sergeant	20%
910	Michael Thamida	TIMOR	Junior/Youth Program	Sigmund	Sergeant	70%
911	Meivellynn Thamida	TIMOR	Junior/Youth Program	Galileo (Wed 4-6)	Lt. Colonel	0%
912	Alfred Benyamin Leidin	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Sergeant	100%
913	Roselie Kirana Wijaya	TIMOR	Junior/Youth Program	Newton (Tue 4-6)	Sergeant	90%
914	Leia Kaytlyn Tioe	TIMOR	Junior/Youth Program	Lincoln	Private	100%
915	Rachel Darlyn Udjaja	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Private	100%
916	Valentino Nauli Basa	TIMOR	Junior/Youth Program	Neverland		
917	Harlex Tjengdekia	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Private	13%
918	Fayee Abqaira Putrigian Sinambela	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Sergeant	30%
919	No registration					
920	No registration					
921	No registration					
922	Victoria Cenata	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	Sergeant	90%
923	No registration					
924	Ethan Elka Suyento	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Private	75%
925	Quinn Felicia Foo	TIMOR	Junior/Youth Program	Gates (Sat 10-12)	Private	63%
926	Arthur Ignatius Carrari	TIMOR	Junior/Youth Program	Neverland		
927	Richela Stanlay	TIMOR	Junior/Youth Program	Dale (Sat 4-6)	Sergeant	30%
928	Victoria Roesli	TIMOR	Junior/Youth Program	Neverland		
929	Trevor Hartono Lee	TIMOR	Junior/Youth Program	Newton (Tue 4-6)	Sergeant	20%
930	Celine Nichola Xie	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Private	38%
931	Zealand Charvi Nathang	TIMOR	Junior/Youth Program	Graham	Private	75%
932	Olivia Tjoa	TIMOR	Junior/Youth Program	Maxwell	Sergeant	70%
933	Ivy Jeane Chanella	CEMARA	Junior/Youth Program	Camelot		
934	Zac Anthony Chua	TIMOR	Junior/Youth Program	Hogwarts		
935	Gisella Nyoto	TIMOR	Junior/Youth Program	Robbins (Sat 1-3)	Sergeant	80%
936	No registration					
937	Jillian Claire Kuanrius	TIMOR	Junior/Youth Program	Graham	Sergeant	70%
938	Reagan Nyoto	TIMOR	Junior/Youth Program	Robbins (Sat 1-3)	Sergeant	90%
939	Rexcaden Jazper Shu	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Lt. Colonel	20%
940	No registration					
941	No registration					
942	Elaine Viandi	TIMOR	Junior/Youth Program	Dale (Sat 4-6)	Sergeant	10%
943	No registration					
944	Kent Aldrich Huang	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Private	38%
945	Angeline Felice Theo	TIMOR	Junior/Youth Program	Newton (Tue 4-6)	Private	75%
946	Ryufin Junus	TIMOR	Junior/Youth Program	Robbins (Sat 1-3)	Private	100%
947	Nayyara Ayaskara Prakasita	TIMOR	Junior/Youth Program	Gandhi	Sergeant	80%
948	Erick Winner Teo	TIMOR	Junior/Youth Program	Tracy (Sat 4-6)	Lt. Colonel	0%
949	Amelia Irawan	TIMOR	Junior/Youth Program	Graham	Private	63%
950	Audrey Madison Loewe	TIMOR	Junior/Youth Program	Lincoln	Private	100%
951	Mavin Jericho Phen	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Sergeant	60%
952	Louis Alvaro Wang	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Private	38%
953	Chloe Valencia Wang	TIMOR	Junior/Youth Program	Ziglar (Sat 4-6)	Lt. Colonel	50%
954	Ammiel Malikha Lamria	TIMOR	Junior/Youth Program	Graham	Private	63%
955	Naomi Grace Edward	TIMOR	Junior/Youth Program	Graham	Sergeant	80%
956	Aileen Sophie Kesuma	TIMOR	Junior/Youth Program	Maxwell	Sergeant	60%
957	Rafifa Aisha Mahira	TIMOR	Junior/Youth Program	Robbins (Sat 1-3)	Private	63%
958	Raisya Putri Raharjo	TIMOR	Junior/Youth Program	Tracy (Sat 4-6)	Sergeant	50%
959	Aleyna Chandra	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Private	100%
960	No registration					
961	No registration					
962	Ananda Putera Ngadiman	TIMOR	Junior/Youth Program	Mandela	Sergeant	20%
963	Yasmina Athirah Rifqi	TIMOR	Junior/Youth Program	Gladwell	Private	100%
964	Yazeed Abizar Rifqi	TIMOR	Junior/Youth Program	Lincoln	Private	75%
965	Modric Agusta Daruma	TIMOR	Junior/Youth Program	Maxwell	Sergeant	70%
966	No registration					
967	No registration					
968	Lady Valery Sinambela	TIMOR	Junior/Youth Program	Newton (Tue 4-6)	Sergeant	40%
969	Jordan Keegan	TIMOR	Junior/Youth Program	Newton (Tue 4-6)	Private	50%
970	Annabela Himeko Winarta	TIMOR	Junior/Youth Program	Newton (Tue 4-6)	Sergeant	40%
971	No registration					
972	Darren Javier Wu	TIMOR	Junior/Youth Program	Galileo (Wed 4-6)	Sergeant	100%
973	No registration					
974	No registration					
975	No registration					
976	No registration					
977	Micha Belle Tan	TIMOR	Junior/Youth Program	Gates (Sat 10-12)	Private	25%
978	Clara Jill Valerie	TIMOR	Junior/Youth Program	Maxwell	Private	100%
979	No registration					
980	Ezio Lim	TIMOR	Junior/Youth Program	Marley	Sergeant	80%
981	Joey Milan Phen	TIMOR	Junior/Youth Program	Robbins (Sat 1-3)	Sergeant	80%
982	Abigail Hazel Tamin	TIMOR	Junior/Youth Program	Gladwell	Sergeant	10%
983	Jashton Tokyo	TIMOR	Junior/Youth Program	Newton (Tue 4-6)	Private	25%
984	Chaden Ettienne Halim	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	Sergeant	80%
985	No registration					
986	Jason Allen Tjoa	TIMOR	Junior/Youth Program	Newton (Tue 4-6)	Sergeant	70%
987	Caren Pandiago	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Sergeant	10%
988	Gavyn Wijaya	TIMOR	Junior/Youth Program	Maxwell	Sergeant	80%
989	Federico Fredelyn Jeoh	TIMOR	Junior/Youth Program	Gladwell	Sergeant	100%
990	Zason Riady Ko	TIMOR	Junior/Youth Program	Whomville		
991	Arya Kho	TIMOR	Junior/Youth Program	Tracy (Sat 4-6)	Private	100%
992	James Ananda Wijaya	TIMOR	Junior/Youth Program	Maxwell	Private	75%
993	Miranda Belle Tan	TIMOR	Junior/Youth Program	Gates (Sat 10-12)	Private	
994	Valisha Sofi Tjandra	TIMOR	Junior/Youth Program	Sigmund	Private	88%
995	Qori Putri Syahviah	TIMOR	Junior/Youth Program	Gladwell	Sergeant	20%
996	Venesia Anggini Purba	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Sergeant	10%
997	Jovin Limcoln	TIMOR	Junior/Youth Program	DaVinci	Sergeant	20%
998	Fedrick Wijaya	TIMOR	Junior/Youth Program	DaVinci	Private	100%
999	Annabelle Grace Wu	TIMOR	Junior/Youth Program	Lincoln	Sergeant	20%
1000	Chloe Sinjaya	TIMOR	Junior/Youth Program	Narnia		
1001	Hanson Nicolas Chandra	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Private	38%
1002	Hubert Ulrich Tan	TIMOR	Junior/Youth Program	Gladwell	Private	63%
1003	Arthur Alexander Hakim	TIMOR	Junior/Youth Program	Gladwell	Sergeant	50%
1004	Vederrick Ethan Jap	TIMOR	Junior/Youth Program	Gandhi	Private	50%
1005	Gisella	TIMOR	Junior/Youth Program	Sigmund	Private	100%
1006	Jerico	TIMOR	Junior/Youth Program	Sigmund	Private	63%
1007	Davina Grace Ong	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Sergeant	10%
1008	Sydney Princessa Lim	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Sergeant	60%
1009	Felicia Grace Ong	TIMOR	Junior/Youth Program	Mandela	Private	100%
1010	Gracielle Grace Ong	TIMOR	Junior/Youth Program	Mandela	Private	10%
1011	Clarence		Junior/Youth Program			
1012	Clarence Aurelia Colim	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Private	100%
1013	Michelle Kalyani	TIMOR	Junior/Youth Program	Gladwell	Private	63%
1014	Catherine Gotami	TIMOR	Junior/Youth Program	Hogwarts		
1015	Fransisca	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Sergeant	0%
1016	No registration					
1017	Harvardo Lovenzo Susanto	TIMOR	Junior/Youth Program	Gladwell	Sergeant	50%
1018	Freddy Salim	TIMOR	Junior/Youth Program	Ziglar (Sat 4-6)	Private	38%
1019	Louis Clinton Chai	TIMOR	Junior/Youth Program	Mandela	Private	100%
1020	Caren Axella Natania Lumbantoruan	CEMARA	Junior/Youth Program	Beryl	Sergeant	60%
1021	No registration					
1022	Efraim Lucas Dimitri	TIMOR	Junior/Youth Program	Newton (Tue 4-6)	Private	75%
1023	Darryl Raynold Leowe	TIMOR	Junior/Youth Program	Spielberg (Sat 4-6)	Private	100%
1024	Chloe Audrey Chen	TIMOR	Junior/Youth Program	Hogwarts		
1025	Hermione Lovely Susanto	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Sergeant	50%
1026	Angelina Novita Chandra	TIMOR	Junior/Youth Program	Ziglar (Sat 4-6)	Private	50%
1027	Elnino Jehanra Saragih	TIMOR	Junior/Youth Program	Spielberg (Sat 4-6)	Lt. Colonel	0%
1028	Darren Winston	CEMARA	Junior/Youth Program	Sapphire	Private	63%
1029	Luna Antoinette Linne	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Sergeant	10%
1030	Valerie Rosalyn Yap	TIMOR	Junior/Youth Program	Gates (Sat 10-12)	Private	100%
1031	Jacques Lewinsky	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Sergeant	10%
1032	Joey Celine	TIMOR	Junior/Youth Program	Maxwell	Private	100%
1033	Shelvina Howie	TIMOR	Junior/Youth Program	Canfield	Lt. Colonel	90%
1034	Cherryl Riquelme Potan	TIMOR	Junior/Youth Program	Gandhi	Sergeant	30%
1035	Adeline Luhur	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Private	20%
1036	Verencia Alden	TIMOR	Junior/Youth Program	Gandhi	Private	100%
1037	Caitlyn Allison Yaphen	TIMOR	Junior/Youth Program	Gandhi	Sergeant	20%
1038	Devon Jau	TIMOR	Junior/Youth Program	Canfield	Sergeant	60%
1039	Naafa Maisyva Ginting	TIMOR	Junior/Youth Program	Gandhi	Sergeant	20%
1040	Shane Anastasya Kristy Simangunsong	TIMOR	Junior/Youth Program	Graham	Sergeant	100%
1041	Chloe Taydey	TIMOR	Junior/Youth Program	Canfield	Sergeant	60%
1042	Maydelyn Zhang	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Private	63%
1043	Kenrich Thantio Yangderson	TIMOR	Junior/Youth Program	Neverland		
1044	Dominic Kie	TIMOR	Junior/Youth Program	Tracy (Sat 4-6)	Sergeant	10%
1045	Silvario Soedidjo	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Sergeant	90%
1046	Max Wayne Subroto	TIMOR	Junior/Youth Program	Newton (Tue 4-6)	Private	30%
1047	Jordan Tanutama	TIMOR	Junior/Youth Program	Graham	Private	100%
1048	Reynard Lis	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Private	38%
1049	Rafael Maximillian Sitorus	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Sergeant	100%
1050	Galang Roland Besch	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Sergeant	100%
1051	Timothy Anwi Panca	TIMOR	Junior/Youth Program	Canfield	Sergeant	30%
1052	Carlene Yang	TIMOR	Junior/Youth Program	Gates (Sat 10-12)	Private	50%
1053	Elaine Clemence Annabell	TIMOR	Junior/Youth Program	Canfield	Private	100%
1054	Renata Allie Rusli	TIMOR	Junior/Youth Program	Dale (Sat 4-6)	Private	63%
1055	Reginald Ali Rusli	TIMOR	Junior/Youth Program	Dale (Sat 4-6)	Private	63%
1056	Yeslin Yap	TIMOR	Junior/Youth Program	Gandhi	Private	100%
1057	Louis Xavier Leonardi	TIMOR	Junior/Youth Program	Dale (Sat 4-6)	Private	88%
1058	Gracia Tiffany Susanto	TIMOR	Junior/Youth Program	Canfield	Sergeant	50%
1059	Meuthia Gadiza	TRITURA	Junior/Youth Program	Asheville	Sergeant	100%
1060	Zac Aldrich Mayor	TIMOR	Junior/Youth Program	Dale (Sat 4-6)	Private	100%
1061	Kayden Skylar Sanso	TIMOR	Junior/Youth Program	Hogwarts		
1062	Queensya Lovely Reya	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Sergeant	80%
1063	Nicole Beh	TIMOR	Junior/Youth Program	Dale (Sat 4-6)	Private	63%
1064	Morgan Beh	TIMOR	Junior/Youth Program	Wonderland		
1065	Maxwell Louis Jaya	TIMOR	Junior/Youth Program	Wonderland		
1066	Samuel Christopher Halim	TIMOR	Junior/Youth Program	Neverland		
1067	Richester Casvio Liong	TIMOR	Junior/Youth Program	Hogwarts		
1068	Hiero Haydenzo Huang	TIMOR	Junior/Youth Program	Wonderland		
1069	Kartrine Sathya Felim	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	Private	75%
1070	Krishna Dhammo Felim	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Private	50%
1071	Chloe Aurelia Ten	TIMOR	Junior/Youth Program	Gates (Sat 10-12)	Sergeant	90%
1072	Hazel Natalie Ten	TIMOR	Junior/Youth Program	Dale (Sat 4-6)	Sergeant	100%
1073	Scarlett Avery Ten	TIMOR	Junior/Youth Program	Wonderland		
1074	Ayska Najya Prakasita	TIMOR	Junior/Youth Program	Tracy (Sat 4-6)	Sergeant	10%
1075	Bryan Michael Ng	TIMOR	Junior/Youth Program	Gates (Sat 10-12)	Sergeant	10%
1076	Brayden Matthew Ng	TIMOR	Junior/Youth Program	Gates (Sat 10-12)	Sergeant	10%
1077	Alqueenza Syifa Winona	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Sergeant	20%
1078	Ethan Kenny Daruma	TIMOR	Junior/Youth Program	DaVinci	Private	100%
1079	Keigo Kusuno Soh	TIMOR	Junior/Youth Program	Tracy (Sat 4-6)	Private	50%
1080	Reynara Amber Koiman	TIMOR	Junior/Youth Program	Tracy (Sat 4-6)	Private	50%
1081	Carlton Kho	CEMARA	Junior/Youth Program	Pearl	Private	100%
1082	Davin Obert Khoo	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Private	38%
1083	Gillian Alexa Pearl	TIMOR	Junior/Youth Program	Hogwarts		
1084	Leonard Nyoto	TIMOR	Junior/Youth Program	Wonderland		
1085	Garent Nyoto	TIMOR	Junior/Youth Program	Wonderland		
1086	Kayden Ethan Zhou	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Private	88%
1087	Nicole Eunice Lautan	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Private	100%
1088	Alesha Sofia Andhika	TIMOR	Junior/Youth Program	Maxwell	Sergeant	20%
1089	Jessica Jo	TIMOR	Junior/Youth Program	Hogwarts		
1090	Healey Tjoe	TIMOR	Junior/Youth Program	Robbins (Sat 1-3)	Private	88%
1091	Jennifer Othniella Situmorang	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Private	50%
1092	Jill Madison Ali	TIMOR	Junior/Youth Program	Robbins (Sat 1-3)	Private	50%
1093	Annastasia Hideko Winarta	TIMOR	Junior/Youth Program	Hogwarts		
1094	Howard Richer Thia	TIMOR	Junior/Youth Program	Mandela	Private	25%
1095	Regina Fortuna Amal		Junior/Youth Program			
1096	Maxwell Kenson Wibisono	TIMOR	Junior/Youth Program	Narnia		
1097	Reia Rose Winfield	TIMOR	Junior/Youth Program	Narnia		
1098	Naia Sydney Winfield	TIMOR	Junior/Youth Program	Narnia		
1099	Cleva Levica	TIMOR	Junior/Youth Program	Narnia		
1100	Khansa Salsabila	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Private	63%
1101	Fredella Alexa Maranggi Siregar	TIMOR	Junior/Youth Program	Graham	Private	63%
1102	Adhyasta William Nugroho	TIMOR	Junior/Youth Program	Graham	Private	38%
1103	Nicholas Tjin	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Sergeant	40%
1104	Abbygael Mikaela Tangelyn	TIMOR	Junior/Youth Program	Galileo (Wed 4-6)	Sergeant	100%
1105	Keiko Aiby Lim	TIMOR	Junior/Youth Program	Whomville		
1106	Vierra Cleevany Ryu	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Private	100%
1107	Gwyneth Louisa Yap	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Private	88%
1108	Zea Alesha Rizki	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Private	38%
1109	Princess Latheefa Azzura	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Private	38%
1110	Aaron Yang	TIMOR	Junior/Youth Program	Robbins (Sat 1-3)	Private	
1111	Howie Leonard Wijaya	TIMOR	Junior/Youth Program	Galileo (Wed 4-6)	Private	63%
1112	Maynard Jeremiah Simarmata	TIMOR	Junior/Youth Program	Winfrey (Thursday 4-6)	Private	63%
1113	Joe Benedict Japto	TIMOR	Junior/Youth Program	Narnia		
1114	James Tjoa	TIMOR	Junior/Youth Program	Whomville		
1115	Reagan Oliver Zhuang	TIMOR	Junior/Youth Program	Wonderland		
1116	Kim Megumi	TIMOR	Junior/Youth Program	Sigmund	Private	88%
1117	Claire Gabrielle Oscar	TIMOR	Junior/Youth Program	Wonderland		
1118	Reagan Thierry Wijaya	TIMOR	Junior/Youth Program	Robbins (Sat 1-3)	Private	38%
1119	Andrea Dimitri Ashraafi Lazzaroni	TIMOR	Junior/Youth Program	Whomville		
1120	Reynand Wijaya	TIMOR	Junior/Youth Program	Whomville		
1121	Liam John Rickson	TIMOR	Junior/Youth Program	Marley	Private	25%
1122	Leeanne Jane Lim	TIMOR	Junior/Youth Program	Neverland		
1123	Joequinn Felysse Warsono	TIMOR	Junior/Youth Program	Mandela	Private	50%
1124	Felicia Liangso	TIMOR	Junior/Youth Program	Canfield	Private	50%
1125	Grace Anastasia Zeng	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Sergeant	100%
1126	Yedidyah Mikaela Erina		Junior/Youth Program			
1127	Edric Luiz Ongka	TIMOR	Junior/Youth Program	Sigmund	Private	50%
1128	Lashira Awbinsriee Pane	TIMOR	Junior/Youth Program	Hogwarts		
1129	Stephanie Evelyn Luo	TIMOR	Junior/Youth Program	Gandhi	Private	100%
1130	Ethan Ray Maxwell	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Sergeant	75%
1131	Vinxiero Carrick Francoiz	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Private	75%
1132	Nicole Lee	TIMOR	Junior/Youth Program	Marley	Private	38%
1133	Natalie Willeen Zhang	TIMOR	Junior/Youth Program	Kiyosaki (Sat 4-6)	Private	38%
1134	Kent Nanda Daruma	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Private	38%
1135	Cherysse Auryn Khobert	TIMOR	Junior/Youth Program	Marley	Private	20%
1136	Ernesto Zedden Wirawan		Junior/Youth Program			
1137	Celine Angeline Yiandri	TIMOR	Junior/Youth Program	Grande (Thu 4-6 PM)	Private	25%
1138	Mike Louis Wijaya	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Private	50%
1139	Wilbert Wijaya	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	Private	63%
1140	Keita Raelyn Deng	TIMOR	Junior/Youth Program	Wonderland		
1141	Joyce Nathania Shen	TIMOR	Junior/Youth Program	Wonderland		
1142	Oscar Linwood	TIMOR	Junior/Youth Program	Neverland		
1143	Rico Alvaro Chandra	TIMOR	Junior/Youth Program	Marley	Private	
1144	Kayla Shilyn Gani	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	Private	88%
1145	Gallen Yuman King	TIMOR	Junior/Youth Program	Neverland		
1146	Charis Yafa Tobing	TIMOR	Junior/Youth Program	Maxwell	Private	100%
1147	Calista Kasih Aprilia Harahap	TIMOR	Junior/Youth Program	Marley	Private	25%
1148	Talysha Sri Nayla	TIMOR	Junior/Youth Program	Marley	Private	25%
1149	Arnold Alexander Hakim	TIMOR	Junior/Youth Program	Hogwarts		
1150	Kellyn Chandra	TIMOR	Junior/Youth Program	Canfield	Private	88%
1151	Theona Zefanya Purba	TIMOR	Junior/Youth Program	Sigmund	Private	88%
1152	Javerson Joshua Tobing	TIMOR	Junior/Youth Program	Sigmund	Private	30%
1153	Philippe Benedict Zhuang	TIMOR	Junior/Youth Program	Marley	Private	38%
1154	Aca Raymond Tjemerlang	TIMOR	Junior/Youth Program	Gandhi	Private	13%
1155	Howard Winston Louis	TIMOR	Junior/Youth Program	Tracy (Sat 4-6)	Private	38%
1156	Alika Zelmira Wibowo	TIMOR	Junior/Youth Program	Ziglar (Sat 4-6)	Private	
1157	Gywen Stefanie Wiley	TIMOR	Junior/Youth Program	Ziglar (Sat 4-6)	Private	38%
1158	Kendrick Eoghan	TIMOR	Junior/Youth Program	Mandela	Private	25%
1159	Kezia Zenitha Sinaga	TIMOR	Junior/Youth Program	Ziglar (Sat 4-6)	Private	
1160	Karen Kallenia Sinaga	TIMOR	Junior/Youth Program	Whomville		
1161	Randa Miracle Boasly Sihombing	TIMOR	Junior/Youth Program	Galileo (Wed 4-6)	Private	63%
1162	Carine Susanto Lie	TIMOR	Junior/Youth Program	Ziglar (Sat 4-6)	Private	25%
1163	Azarine Apriza Darmawan	TIMOR	Junior/Youth Program	Ziglar (Sat 4-6)	Private	
1164	Felicia Ivana Silalahi	TIMOR	Junior/Youth Program	DaVinci	Private	
1165	Madeline Lauren	TIMOR	Junior/Youth Program	Whomville		
1166	Anderson Putra Supama	TIMOR	Junior/Youth Program	Narnia		
1167	Fredericka Sigalingging	TIMOR	Junior/Youth Program	Ziglar (Sat 4-6)	Private	
1168	Viorencia Tantana	TIMOR	Junior/Youth Program	Ziglar (Sat 4-6)	Private	
1169	Gisellene Lowisuri	TIMOR	Junior/Youth Program	Ziglar (Sat 4-6)	Private	
1170	Kaylynn Zhanghoven	TIMOR	Junior/Youth Program	Marley	Private	
1171	Angelina Cenata	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Private	
1172	Ferdian Zulkarnain	TIMOR	Junior/Youth Program	Neverland		
1173	Mia Emily Soeripin	TIMOR	Junior/Youth Program	Whomville		
1174	Vivienne Claire Soeripin	TIMOR	Junior/Youth Program	Socrates	Private	
1175	Vingeline Chelsealya Angkasa	TIMOR	Junior/Youth Program	Hogwarts		
1176	Jean Catherine Anneliese Sebayang	TIMOR	Junior/Youth Program	Einstein	Private	
1177	James Edward Lie	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)		
1178	Richeline Huang	TIMOR	Junior/Youth Program	Socrates	Private	
1179	Livi Celia Lim	TIMOR	Junior/Youth Program	Marley	Private	
1180	Hariwell	TIMOR	Junior/Youth Program	Einstein	Private	
1181	Azzam Al Vanka	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Private	
1182	Stella Wijaya	TIMOR	Junior/Youth Program	Neverland		
1183	Maxwell Utomo	TIMOR	Junior/Youth Program	Einstein	Private	
1184	Louis Sinclair Zuary	TIMOR	Junior/Youth Program	Plato	Private	
1185	Genovia Grace Widjaja	TIMOR	Junior/Youth Program	Whomville		
1186	Ray Yudhistira Ng	TIMOR	Junior/Youth Program	Einstein	Private	
1187	Michelle Aurelia Chen	TIMOR	Junior/Youth Program	Socrates	Private	
1188	James Oliver Coaca	TIMOR	Junior/Youth Program	Plato	Private	
1189	Kennan Eito Shankara	TIMOR	Junior/Youth Program	Wonderland		
1190	Nalina Vimala	TIMOR	Junior/Youth Program	Aristotle	Private	
1191	Joya Vania Silaen	TIMOR	Junior/Youth Program	Einstein	Private	
1192	Sergio Ronald Utomo	TIMOR	Junior/Youth Program	Aristotle	Private	
1193	Cheryl Eilyn Affandy	TIMOR	Junior/Youth Program	Clinton (Fri 3-5)	Private	
1194	Max Kingston Marzuki	TIMOR	Junior/Youth Program	Aristotle	Private	
1195	Kenzo Wibowo Marzuki	TIMOR	Junior/Youth Program	Aristotle	Private	
1196	Grace Martok	TIMOR	Junior/Youth Program	Aristotle	Private	
1197	Adzkiya Kyona Mahendra		Junior/Youth Program			
1198	Jovan Jonathan Cen	TIMOR	Junior/Youth Program	Einstein	Private	
1199	Joey Jonas Cen	TIMOR	Junior/Youth Program	Einstein	Private	
1200	Jayden Darren Wijaya		Junior/Youth Program			
1201	Ivania Gracesinka	TIMOR	Junior/Youth Program	Socrates	Private	
1202	Cornelius Wilfred	TIMOR	Junior/Youth Program	Einstein	Private	
1203	Kevin Fico Aurelio	TIMOR	Junior/Youth Program	Socrates	Private	
1204	Kendrick Filbert Aurelio	TIMOR	Junior/Youth Program	Socrates	Private	
1205	Kaylee Alessia Ridgen	TIMOR	Junior/Youth Program	Whomville		
1206	Daniel Haryanto	TIMOR	Junior/Youth Program	Neverland		
1207	James Jayden Chandra	TIMOR	Junior/Youth Program	Einstein	Private	
1208	Dwayne Alvaro Phen	TIMOR	Junior/Youth Program	Doyle (Sat 1-3)	Private	
1209	Michele Cecilia Belvania Saragih	TIMOR	Junior/Youth Program	Graham	Private	
1210	Joycelyn Annabelle	TIMOR	Junior/Youth Program	Einstein	Private	
1211	Dion Lorenzo Castio	TIMOR	Junior/Youth Program	Plato	Private	
1212	Aurelia Wyanto	TIMOR	Junior/Youth Program	Ziglar (Sat 4-6)	Private	
1213	Kaylee Wayne Laong	TIMOR	Junior/Youth Program	Einstein	Private	
1214	Fiona Tjongnata	TIMOR	Junior/Youth Program	Socrates	Private	
1215	Julfini Chu		Junior/Youth Program			
1216	Marc Maximus Zhang	TIMOR	Junior/Youth Program	Einstein	Private	
1217	Daxton Lie	TIMOR	Junior/Youth Program	Sigmund	Private	
1218	Odilia Alexandra Yang	TIMOR	Junior/Youth Program	Einstein	Private	
1219	Naviauly Dolorosa Sinaga	TIMOR	Junior/Youth Program	DaVinci	Private	
1220	Kinara Caliezia Pangestu	TIMOR	Junior/Youth Program	Einstein	Private	
1221	Cika Linatasia Tampubolon	TIMOR	Junior/Youth Program	Socrates	Private	
1222	Hans Andersen Yap	TIMOR	Junior/Youth Program	Aristotle	Private	
1223	Steve Marcellino	TIMOR	Junior/Youth Program	Socrates	Private	
1224	Collins Anderson	TIMOR	Junior/Youth Program	Socrates	Private	
1225	Winnie Lorenz Tjialin	TIMOR	Junior/Youth Program	Plato	Private	
1226	No registration					
1227	No registration					
1228	No registration					
1229	No registration					
1230	No registration					
1231	No registration					
1232	No registration					
1233	No registration					
1234	No registration					
1235	No registration					
1236	No registration					
1237	No registration					
1238	No registration					
1239	No registration					
1240	No registration					
1241	No registration					
1242	No registration					
1243	No registration					
1244	No registration					
1245	No registration					
1246	No registration					
1247	No registration					
1248	No registration					
1249	No registration					
1250	No registration					
1251	No registration					
1252	No registration					
1253	No registration					
1254	No registration					
1255	No registration					
1256	No registration					
1257	No registration					
1258	No registration					
1259	No registration					
1260	No registration					
1261	No registration					
1262	No registration					
1263	No registration					
1264	No registration					
1265	No registration					
1266	No registration					
1267	No registration					
1268	No registration					
1269	No registration					
1270	No registration					
1271	No registration					
1272	No registration					
1273	No registration					
1274	No registration					
1275	No registration					
1276	No registration					
1277	No registration					
1278	No registration					
1279	No registration					
1280	No registration					
1281	No registration					
1282	No registration					
1283	No registration					
1284	No registration					
1285	No registration					
1286	No registration					
1287	No registration					
1288	No registration					
1289	No registration					
1290	No registration					
1291	No registration					
1292	No registration					
1293	No registration					
1294	No registration					
1295	No registration					
1296	No registration					
1297	No registration					
1298	No registration					
1299	No registration					
1300	No registration					
70100001	Katrisha Davinia Lim	TRITURA	Junior/Youth Program	Atlanta	Sergeant	70%
70100002	Matthew Yeo	TRITURA	Junior/Youth Program	Athens	Lt. Colonel	0%
70100003	Cherisse Wong Jono	TRITURA	Junior/Youth Program	Asgard	Sergeant	50%
70100004	Maryam Shareen Anandifa	TRITURA	Junior/Youth Program	Denver	Lt. Colonel	50%
70100005	Lyvia Verlynn	TRITURA	Junior/Youth Program	Almeria	Colonel	0%
70100006	Jason Hartono Huang	TIMOR	Junior/Youth Program	Ziglar (Sat 4-6)	Sergeant	70%
70100007	Jevany	TRITURA	Junior/Youth Program	Asgard	Private	100%
70100008	Clarissa Ruthana Sipayung	TRITURA	Junior/Youth Program	Berlin	Private	63%
70100009	No registration					
70100010	Nicole Rikki	TRITURA	Junior/Youth Program	Athens	Private	88%
70100011	No registration					
70100012	No registration					
70100013	No registration					
70100014	Desmond Dinata Ong	TRITURA	Junior/Youth Program	Cairo	Private	75%
70100015	Judyth Annabelle Naulibasa 	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	Private	
70100016	Dwayne Jzekiel Angsana	TRITURA	Junior/Youth Program	Cairo	Private	75%
70100017	No registration					
70100018	No registration					
70100019	Andrea Tabitha Florencia Simatupang	TRITURA	Junior/Youth Program	Athens	Lt. Colonel	40%
70100020	Diandra Ezra Nauli Simatupang	TRITURA	Junior/Youth Program	Athens	Lt. Colonel	60%
70100021	Rafael Daniello Tamba	TRITURA	Junior/Youth Program	Asgard	Sergeant	60%
70100022	Josandy	TRITURA	Junior/Youth Program	Asgard	Private	63%
70100023	Evonne Gwen Lim	TRITURA	Junior/Youth Program	Cairo	Sergeant	0%
70100024	No registration					
70100025	No registration					
70100026	No registration					
70100027	Daniel Goh	TRITURA	Junior/Youth Program	Auckland	Sergeant	0%
70100028	Elaine Gwen Lim	TRITURA	Junior/Youth Program	Cairo	Lt. Colonel	20%
70100029	No registration					
70100030	No registration					
70100031	Rahardian Ozil S	TRITURA	Junior/Youth Program	Denver	Private	50%
70100032	No registration					
70100033	No registration					
70100034	Muazzam Khalifi Adera	TRITURA	Junior/Youth Program	Denver	Private	100%
70100035	Fasya Putradinata Syam	TIMOR	Junior/Youth Program	Millman (Sat 1-3)	Sergeant	30%
70100036	Gilbert Faustin Wijaya	TRITURA	Junior/Youth Program	Denver	Lt. Colonel	30%
70100037	Abigail Rhea Lim	TIMOR	Junior/Youth Program	Mandela	Sergeant	100%
70100038	Richard Alexi Pratama	TRITURA	Junior/Youth Program	Denver	Lt. Colonel	0%
70100039	Gwen Valerie	TRITURA	Junior/Youth Program	Denver	Sergeant	0%
70100040	Mario Dominic Warouw	TRITURA	Junior/Youth Program	Asgard	Private	88%
70100041	Raisha Adila Gunawan	TRITURA	Junior/Youth Program	Denver	Lt. Colonel	20%
70100042	Jessica Sharon	TRITURA	Junior/Youth Program	Athens	Lt. Colonel	50%
70100043	Enrico Felix Daniel Siagian	TRITURA	Junior/Youth Program	Asgard	Private	100%
70100044	Amelia Natasha Siagian	TRITURA	Junior/Youth Program	Athens	Private	50%
70100045	No registration					
70100046	Kirania Inara Azalea	TRITURA	Junior/Youth Program	Atlanta	Lt. Colonel	80%
70100047	Keyzia Faiana Daulay	TRITURA	Junior/Youth Program	Almeria	Lt. Colonel	60%
70100048	Moreno De Truman	TRITURA	Junior/Youth Program	Athens	Private	100%
70100049	Eillen Faustine Wijaya	TRITURA	Junior/Youth Program	Athens	Sergeant	10%
70100050	Ellys Faustine Wijaya	TRITURA	Junior/Youth Program	Auckland	Lt. Colonel	0%
70100051	Enzo Howell	CEMARA	Junior/Youth Program	Amber	Sergeant	30%
70100052	Darrel Hizkia Tambunan	TRITURA	Junior/Youth Program	Athens	Lt. Colonel	0%
70100053	Ghassan Ghazali Ginting	TRITURA	Junior/Youth Program	Athens	Private	100%
70100054	Olivia Nooman	TRITURA	Junior/Youth Program	Cairo	Private	50%
70100055	Clarissa Kimberly Luvalencia	TRITURA	Junior/Youth Program	Atlanta	Sergeant	20%
70100056	Jason Louis	TRITURA	Junior/Youth Program	Atlanta	Sergeant	10%
70100057	Evelyn Frelda Gurning	TRITURA	Junior/Youth Program	Eldorado	Sergeant	50%
70100058	Anya Pehulisa Ginting	TRITURA	Junior/Youth Program	Eldorado	Lt. Colonel	30%
70100059	Rebecca Florencia Siregar	TRITURA	Junior/Youth Program	Eldorado	Colonel	40%
70100060	Lincoln Blaine	CEMARA	Junior/Youth Program	Amber	Sergeant	70%
70100061	Colleen Blaine	CEMARA	Junior/Youth Program	Quartz	Private	100%
70100062	Nichole Hasan	CEMARA	Junior/Youth Program	Amber	Lt. Colonel	10%
70100063	Calysta Celorine Bakara	TRITURA	Junior/Youth Program	Eldorado	Sergeant	10%
70100064	Rachel Nathania Situmorang	TRITURA	Junior/Youth Program	Eldorado	Sergeant	40%
70100065	No registration					
70100066	No registration					
70100067	No registration					
70100068	Radinka Agra Sitepu	TRITURA	Junior/Youth Program	Athens	Sergeant	0%
70100069	Al Namira Safitri Saragih	TRITURA	Junior/Youth Program	Atlanta	Sergeant	50%
70100070	Keysha Kania Ramaditya	TRITURA	Junior/Youth Program	Asheville	Lt. Colonel	90%
70100071	Muhammad Al Khawarizmi Fairel	TRITURA	Junior/Youth Program	Eldorado	Private	100%
70100072	No registration					
70100073	Tristan Arsenio	TRITURA	Junior/Youth Program	Sherwood Forest		
70100074	Darnell Samahea Lakhomi Laia	TRITURA	Junior/Youth Program	Atlanta	Sergeant	10%
70100075	Maro Louis Dear Purba	TRITURA	Junior/Youth Program	Cairo	Sergeant	60%
70100076	Marwa Alya Sakinah Rangkuti	TRITURA	Junior/Youth Program	Athens	Lt. Colonel	50%
70100077	Aldiana Masha Lovelia Br Sembiring	TRITURA	Junior/Youth Program	Eldorado	Sergeant	90%
70100078	Sakina Alima Regune Harahap	TRITURA	Junior/Youth Program	Atlanta	Lt. General	0%
70100079	Almira Izanti Kamilah Daulay	TRITURA	Junior/Youth Program	Athens	Sergeant	100%
70100080	Dewi Syaahira Sabina Siregar	TRITURA	Junior/Youth Program	Athens	Lt. Colonel	10%
70100081	Carmen Tjokromitro	TRITURA	Junior/Youth Program	Athens	Sergeant	50%
70100082	Careen Tjokromitro	TRITURA	Junior/Youth Program	Athens	Private	63%
70100083	Breanna Octovindo	TRITURA	Junior/Youth Program	Cairo	Sergeant	100%
70100084	No registration					
70100085	No registration					
70100086	Maria Graciana Chica Purba	TRITURA	Junior/Youth Program	Sherwood Forest		
70100087	Micella Alexa Pinem	TRITURA	Junior/Youth Program	Sherwood Forest		
70100088	Mikhayla Tabita Pinem	TRITURA	Junior/Youth Program	Sherwood Forest		
70100089	Aurelia Intan Leung	TRITURA	Junior/Youth Program	Denver	Private	100%
70100090	Annisa Letizia Shanum	TRITURA	Junior/Youth Program	Eldorado	Sergeant	40%
70100091	No registration					
70100092	No registration					
70100093	No registration					
70100094	No registration					
70100095	No registration					
70100096	No registration					
70100097	No registration					
70100098	Erland Sohilida Laia	TRITURA	Junior/Youth Program	Cairo	Sergeant	40%
70100099	No registration					
70100100	No registration					
70100101	No registration					
70100102	Bryan Taslim	TRITURA	Junior/Youth Program	Athens	Sergeant	50%
70100103	No registration					
70100104	No registration					
70100105	No registration					
70100106	Dareen Davinci Ginting	TRITURA	Junior/Youth Program	Denver	Sergeant	60%
70100107	No registration					
70100108	No registration					
70100109	Kania Ghassani Setiawan	TRITURA	Junior/Youth Program	Denver	Private	
70100110	Filbert Wandrew	TRITURA	Junior/Youth Program	Atlanta	Private	63%
70100111	Keshia Nakia Hayfa Azka	TRITURA	Junior/Youth Program	Athens	Private	63%
70100112	Fathi Arkan Wiyatmika	TRITURA	Junior/Youth Program	Atlanta	Sergeant	10%
70100113	Jiselle Hartanto	TIMOR	Junior/Youth Program	Tracy (Sat 4-6)	Private	100%
70100114	Frederika Lovenberg Siahaan	TRITURA	Junior/Youth Program	Atlanta		
70100115	Candice Alicia Wai	TRITURA	Junior/Youth Program	Sherwood Forest		
70100116	Rayyan Putra Raharjo	TRITURA	Junior/Youth Program	Asheville	Private	100%
70100117	Akhdan Arief Athaya	TRITURA	Junior/Youth Program	Asheville	Sergeant	100%
70100118	Cladys Nadine Frietania	TRITURA	Junior/Youth Program	Sherwood Forest		
70100119	Chew Zi Yang	TRITURA	Junior/Youth Program	Auckland	Private	88%
70100120	Aishaqillah Syifatin Mahirah Kurniawan	TRITURA	Junior/Youth Program	Auckland	Private	50%
70100121	Shane Anthony Jawson	TRITURA	Junior/Youth Program	Auckland	Sergeant	80%
70100122	Shadrina Azheema Lubis	TRITURA	Junior/Youth Program	Eldorado	Sergeant	30%
70100123	Shafiqa Adeeva Lubis	TRITURA	Junior/Youth Program	Eldorado	Sergeant	20%
70100124	Mikayla Aqueena Shaquilla	TRITURA	Junior/Youth Program	Athens	Private	38%
70100125	Moni Laprincia Br Ginting	TRITURA	Junior/Youth Program	Auckland	Private	50%
70100126	Berliando Lovely Sihombing	TRITURA	Junior/Youth Program	Sherwood Forest		
70100127	Gabriel Ihut Martuaro Sihombing	TRITURA	Junior/Youth Program	Atlanta	Sergeant	20%
70100128	Syia Kim	TRITURA	Junior/Youth Program	Sherwood Forest		
70100129	Alliya Ellduci Dermawan	TRITURA	Junior/Youth Program	Auckland	Private	100%
70100130	Muhammad Rafa Al Siena	TRITURA	Junior/Youth Program	Auckland	Sergeant	20%
70100131	Clairine Bellvania Gavrila Ginting	TIMOR	Junior/Youth Program	Narnia		
70100132	Devin Suhendra 	TRITURA	Junior/Youth Program	Asheville	Private	75%
70100133	Lionel Maverick 	TRITURA	Junior/Youth Program	Asheville	Sergeant	20%
70100134	Diandra Santika	TRITURA	Junior/Youth Program	Athens	Sergeant	100%
70100135	Adib Nufal Wibowo	TRITURA	Junior/Youth Program	Asheville	Sergeant	100%
70100136	Syakirah Khairani Jamilah	TRITURA	Junior/Youth Program	Asheville	Private	63%
70100137	Frederika Lovenberg Siahaan	TRITURA	Junior/Youth Program	Atlanta		
70100138	Maura Shaqifa Rubyna	TRITURA	Junior/Youth Program	Asheville	Private	50%
70100139	Daniella Demeintieva	TRITURA	Junior/Youth Program	Auckland	Sergeant	60%
70100140	Gabriella Theofanny Putri Meliala	TRITURA	Junior/Youth Program	Asheville	Sergeant	88%
70100141	Aqeela Shafa Batrisya	TRITURA	Junior/Youth Program	Asheville	Private	50%
70100142	Shane Nathantaras Tarigan	TRITURA	Junior/Youth Program	Athens	Private	63%
70100143	Kaleb Edgar Goel Hasugian	TRITURA	Junior/Youth Program	Auckland	Sergeant	100%
70100144	Faqih Fadhilah Wijaya	TRITURA	Junior/Youth Program	Asheville	Private	50%
70100145	Hafiqa Raikhsa Karo Karo	TRITURA	Junior/Youth Program	Asheville	Private	25%
70100146	Alexa Brianna Tambunan	TRITURA	Junior/Youth Program	Almeria	Private	38%
70100147	Faza Kiyana Azdah	TRITURA	Junior/Youth Program	Athens	Sergeant	40%
70100148	Davina Elisha Ginting	TRITURA	Junior/Youth Program	Atlanta	Sergeant	100%
70100149	Jaeson Nathan Yap	TRITURA	Junior/Youth Program	Auckland	Private	50%
70100150	Nadhira Calista Purba	TRITURA	Junior/Youth Program	Eldorado	Private	38%
70100151	Fakhira Idris Harahap	TRITURA	Junior/Youth Program	Atlanta	Private	50%
70100152	Abigail Carissa 	TRITURA	Junior/Youth Program	Atlanta	Private	63%
70100153	Dareen Azel Matthew Sembiring	TRITURA	Junior/Youth Program	Eldorado	Private	63%
70100154	Ashera Natama Sitorus	TRITURA	Junior/Youth Program	Sherwood Forest		
70100155	Stella Aprilia Sianipar 	TRITURA	Junior/Youth Program	Athens	Sergeant	100%
70100156	Tengku Muhammad Malik Al Fatih	TRITURA	Junior/Youth Program	Eldorado	Private	50%
70100157	Faqhan Asshadiq Winata	TRITURA	Junior/Youth Program	Athens	Private	25%
70100158	Gracelyn Patricia	TRITURA	Junior/Youth Program	Atlanta	Sergeant	100%
70100159	Nadia Fathaniah Chandra	TRITURA	Junior/Youth Program	Eldorado	Private	38%
70100160	Jordan Noel Yap	TRITURA	Junior/Youth Program	Denver	Private	
70100161	Khezya Queen Zareen Br Panggabean 	TRITURA	Junior/Youth Program	Auckland	Private	50%
70100162	Arya Satya	TRITURA	Junior/Youth Program	Asheville	Private	38%
70100163	No registration					
70100164	No registration					
70100165	Ghazia Raesha Afthani Lubis	TRITURA	Junior/Youth Program	Athens	Private	
70100166	Farrin Rafania Shezan Lubis	TRITURA	Junior/Youth Program	Eldorado	Private	13%
70100167	Arsa Clianta Saragih	TRITURA	Junior/Youth Program	Almeria	Private	13%
70100168	Mora Leticia Sinaga	TRITURA	Junior/Youth Program	Almeria	Private	13%
70100169	Warren Leander Wichael	TRITURA	Junior/Youth Program	Auckland	Private	
70100170	No registration					
70100171	No registration					
70100172	No registration					
70100173	Muhammad Naufal Athariz Ritonga	TRITURA	Junior/Youth Program	Atlanta	Private	13%
70100174	Jerrick Onggoro Hakim	TRITURA	Junior/Youth Program	Denver	Private	25%
70100175	Ondo Vico Fidelis Giant Sitohang 	TRITURA	Junior/Youth Program	Almeria	Private	13%
70100176	Muhammad Asyam Haris Tanjung 	TRITURA	Junior/Youth Program	Cairo	Private	13%
70100177	Raphael Evan Hiro Ompusunggu	TRITURA	Junior/Youth Program	Sherwood Forest		
70100178	No registration					
70100179	Doria Marchisia Giussevine Saragih	TRITURA	Junior/Youth Program	Cairo	Private	13%
70100180	Jevano Septarey Saragih	TRITURA	Junior/Youth Program	Cairo	Private	13%
70100181	No registration					
70100182	No registration					
70100183	No registration					
70100184	Atha Malik Chairmawan	TRITURA	Junior/Youth Program	Denver	Private	13%
70100185	Alice Nathalie Brigitta	TRITURA	Junior/Youth Program	Almeria	Private	25%
70100186	Alvaro Gavriel Batara Sihotang	TRITURA	Junior/Youth Program	Cairo	Private	13%
70100187	Graccyella Martgehaan	TRITURA	Junior/Youth Program	Auckland	Private	13%
70100188	Latisya Naya Alamsyah Nasution	TRITURA	Junior/Youth Program	Eldorado	Private	13%
70100189	Lashira Naifa Alamsyah Nasution	TRITURA	Junior/Youth Program	Sherwood Forest		
70100190	Arta Glory Hutasoit	TRITURA	Junior/Youth Program	Auckland	Private	13%
70100191	Yosihana Hutasoit	TRITURA	Junior/Youth Program	Cairo	Private	13%
70100192	Kania Laviza Andhini	TRITURA	Junior/Youth Program	Denver	Private	
70100193	Nadhira Ayria Verdian	TRITURA	Junior/Youth Program	Cairo		
70100194	Danella Christabel Hasean Saragih	TRITURA	Junior/Youth Program	Sherwood Forest		
70100195	Marisca Agustina Br Surbakti	TRITURA	Junior/Youth Program	Denver	Private	
70100196	Abdullah Syafa Assyunni Rangkuti	TRITURA	Junior/Youth Program	Atlanta	Private	
70100197	Keira Agatha Dameria Resubun	TRITURA	Junior/Youth Program	Denver	Private	
70100198	No registration					
70100199	No registration					
70100200	No registration					
70100201	No registration					
70100202	No registration					
70100203	No registration					
70100204	No registration					
70100205	No registration					
70100206	No registration					
70100207	No registration					
70100208	No registration					
70100209	No registration					
70100210	No registration					
70100211	No registration					
70100212	No registration					
70100213	No registration					
70100214	No registration					
70100215	No registration					
70100216	No registration					
70100217	No registration					
70100218	No registration					
70100219	No registration					
70100220	No registration					
70100221	No registration					
70100222	No registration					
70100223	No registration					
70100224	No registration					
70100225	No registration					
70100226	No registration					
70100227	No registration					
70100228	No registration					
70100229	No registration					
70100230	No registration					
70100231	No registration					
70100232	No registration					
70100233	No registration					
70100234	No registration					
70100235	No registration					
70100236	No registration					
70100237	No registration					
70100238	No registration					
70100239	No registration					
70100240	No registration					
70100241	No registration					
70100242	No registration					
70100243	No registration					
70100244	No registration					
70100245	No registration					
70100246	No registration					
70100247	No registration					
70100248	No registration					
70100249	No registration					
70100250	No registration					
	No registration					
90100001	Rowan Maverick Ang	CEMARA	Junior/Youth Program	Quartz	Sergeant	100%
90100002	Giselle Liandy	CEMARA	Junior/Youth Program	Topaz	Lt. Colonel	50%
90100003	Ivy Jeane Chanella	CEMARA	Junior/Youth Program	Camelot		
90100004	Jeovenna Cangie	CEMARA	Junior/Youth Program	Diamond	Lt. Colonel	90%
90100005	Felynn Holy Richson	CEMARA	Junior/Youth Program	Pearl	Lt. Colonel	30%
90100006	Kenzie Rowland Huangdinata	CEMARA	Junior/Youth Program	Amber	Private	25%
90100007	Carrick Classico	CEMARA	Junior/Youth Program	Ruby	Sergeant	20%
90100008	Michelle Teochan	CEMARA	Junior/Youth Program	Obsidian	Private	88%
90100009	Marchelline Teochan	CEMARA	Junior/Youth Program	Obsidian	Private	75%
90100010	Chloe Marjorie Wen	CEMARA	Junior/Youth Program	Diamond	Sergeant	90%
90100011	Chloe Quisha Anggara	CEMARA	Junior/Youth Program	Diamond	Sergeant	90%
90100012	Emily Santo	CEMARA	Junior/Youth Program	Jade	Private	
90100013	Candice Julian Sakiwa	CEMARA	Junior/Youth Program	Ruby	Sergeant	80%
90100014	Claire Adelynn Wu	CEMARA	Junior/Youth Program	Pearl	Private	38%
90100015	Clarissa Felicia Chandra	CEMARA	Junior/Youth Program	Ruby	Private	63%
90100016	Rodrigo Lorenzo	CEMARA	Junior/Youth Program	Amber	Private	38%
90100017	Clarabelle Louisa	CEMARA	Junior/Youth Program	Camelot		
90100018	No registration					50%
90100019	No registration					38%
90100020	Winston Hubert	CEMARA	Junior/Youth Program	Ruby	Lt. General	60%
90100021	Aidan Benjamin Yapar	CEMARA	Junior/Youth Program	Emerald	Private	63%
90100022	Jeanice Wu	CEMARA	Junior/Youth Program	Ruby	Sergeant	0%
90100023	Brooklyn Svenrich Ang	CEMARA	Junior/Youth Program	Emerald	Private	50%
90100024	Welceline Charissa Tsjin	CEMARA	Junior/Youth Program	Diamond	Sergeant	80%
90100025	Celine Devina Guo	CEMARA	Junior/Youth Program	Emerald	Private	88%
90100026	Winston Guo	CEMARA	Junior/Youth Program	Emerald	Private	50%
90100027	No registration					38%
90100028	Haylee Weng	CEMARA	Junior/Youth Program	Camelot		
90100029	No registration					
90100030	No registration					
90100031	Marvel Chan Rachmat	CEMARA	Junior/Youth Program	Diamond	Private	38%
90100032	Rohan Chan Rachmat	CEMARA	Junior/Youth Program	Diamond	Private	50%
90100033	Matthew Dunston Halim 	CEMARA	Junior/Youth Program	Emerald	Sergeant	100%
90100034	Quinsha Charlyn Ow	CEMARA	Junior/Youth Program	Jade	Private	100%
90100035	Carlen Edeline Br. Keliat	CEMARA	Junior/Youth Program	Obsidian	Sergeant	10%
90100036	Carlos Ferdinand Putra	CEMARA	Junior/Youth Program	Jade	Sergeant	80%
90100037	No registration					
90100038	No registration					38%
90100039	Reynard Alderich Guntur	CEMARA	Junior/Youth Program	Avalon		
90100040	No registration					100%
90100041	Philips	CEMARA	Junior/Youth Program	Ruby	Private	50%
90100042	Justin Nawi	CEMARA	Junior/Youth Program	Ruby	Private	100%
90100043	Valentino Owen Liu	CEMARA	Junior/Youth Program	Jade	Private	100%
90100044	Velove Alexa Winstan	CEMARA	Junior/Youth Program	Amethyst	Sergeant	20%
90100045	David Howard	CEMARA	Junior/Youth Program	Amethyst	Sergeant	50%
90100046	Hugo Maximus Ling	CEMARA	Junior/Youth Program	Avalon		
90100047	Bryant Maximus Ling	CEMARA	Junior/Youth Program	Amber	Sergeant	40%
90100048	No registration					75%
90100049	Harvey Susanto	CEMARA	Junior/Youth Program	Alexandrite	Sergeant	20%
90100050	No registration					
90100051	Valerie Legolas Cen	CEMARA	Junior/Youth Program	Obsidian	Private	
90100052	No registration					
90100053	No registration					
90100054	No registration					
90100055	Felicia Tham	CEMARA	Junior/Youth Program	Quartz	Sergeant	20%
90100056	Thalissha Yeonan	CEMARA	Junior/Youth Program	Ruby	Sergeant	0%
90100057	Edward Lie	CEMARA	Junior/Youth Program	Ruby	Private	100%
90100058	Najla Putri Yosifa	CEMARA	Junior/Youth Program	Ruby	Private	75%
90100059	Jared Nawi	CEMARA	Junior/Youth Program	Jade	Private	
90100060	Alfred Smaver Tanasal	CEMARA	Junior/Youth Program	Amber	Sergeant	60%
90100061	Elaine Gabriella Chandella	CEMARA	Junior/Youth Program	Obsidian	Sergeant	10%
90100062	Cherish Graciella Chandella	CEMARA	Junior/Youth Program	Jade	Sergeant	100%
90100063	Fraderic Milerlim	CEMARA	Junior/Youth Program	Obsidian	Private	50%
90100064	Olson Arfayo	CEMARA	Junior/Youth Program	Obsidian	Sergeant	20%
90100065	Richia Dominic Liawfanny	CEMARA	Junior/Youth Program	Amber	Private	25%
90100066	Celine Oubre	CEMARA	Junior/Youth Program	Quartz	Sergeant	100%
90100067	Victor Alexander Winstan	CEMARA	Junior/Youth Program	Topaz	Sergeant	80%
90100068	Ixchel Lowell Tankiono	CEMARA	Junior/Youth Program	Jade	Sergeant	30%
90100069	Erynn Maxine Lau	CEMARA	Junior/Youth Program	Ruby	Private	75%
90100070	Jack Austin Sia	CEMARA	Junior/Youth Program	Quartz	Private	100%
90100071	Kevin Declan Kusumo	CEMARA	Junior/Youth Program	Topaz	Sergeant	40%
90100072	Kenji Ryo Kusumo	CEMARA	Junior/Youth Program	Topaz	Sergeant	20%
90100073	No registration					
90100074	Faulina Theresia Pangaribuan	CEMARA	Junior/Youth Program	Jade	Private	100%
90100075	Kingsley Alisson Tenang	CEMARA	Junior/Youth Program	Avalon		
90100076	Carolline Jackqueen Cen	CEMARA	Junior/Youth Program	Emerald	Private	63%
90100077	Olivia Lincoln	CEMARA	Junior/Youth Program	Emerald	Private	40%
90100078	No registration					
90100079	Gracella Cangie	CEMARA	Junior/Youth Program	Topaz	Sergeant	20%
90100080	Vanessa Cangie	CEMARA	Junior/Youth Program	Topaz	Lt. Colonel	0%
90100081	Hayden Fredderick Halim	CEMARA	Junior/Youth Program	Diamond	Lt. Colonel	40%
90100082	Tang En Xin	CEMARA	Junior/Youth Program	Ruby	Sergeant	30%
90100083	Filbert Laithen	CEMARA	Junior/Youth Program	Ruby	Sergeant	80%
90100084	Warren Nicholas Khu	CEMARA	Junior/Youth Program	Camelot		
90100085	Frederico Sanrio Sanjaya	CEMARA	Junior/Youth Program	Topaz	Sergeant	100%
90100086	Eric Williarn	CEMARA	Junior/Youth Program	Emerald	Private	25%
90100087	Finn Maxwell	CEMARA	Junior/Youth Program	Alexandrite	Sergeant	30%
90100088	Khairiy Raka Azizi Hermansyah	CEMARA	Junior/Youth Program	Obsidian	Sergeant	20%
90100089	Alvyn Zhu	CEMARA	Junior/Youth Program	Obsidian	Private	100%
90100090	Alfarizy Raqila Hermansyah	CEMARA	Junior/Youth Program	Camelot		
90100091	Heidi Tanamin	CEMARA	Junior/Youth Program	Obsidian	Private	38%
90100092	Adlyansah Rizki Tiloli	CEMARA	Junior/Youth Program	Alexandrite	Private	
90100093	Jesslyn Lee	CEMARA	Junior/Youth Program	Ruby	Private	75%
90100094	Feliks Ananda Lee	CEMARA	Junior/Youth Program	Alexandrite	Private	100%
90100095	No registration					
90100096	No registration					
90100097	Annabel Audriana	CEMARA	Junior/Youth Program	Topaz	Sergeant	50%
90100098	Meghan Hailey Hidayat	CEMARA	Junior/Youth Program	Camelot		
90100099	Rowan Tirta Lee	CEMARA	Junior/Youth Program	Ruby	Private	75%
90100100	Jasmine Zhang	CEMARA	Junior/Youth Program	Pearl	Private	63%
90100101	Jayden Zhang	CEMARA	Junior/Youth Program	Sapphire	Private	63%
90100102	Chloe Marche Khu	CEMARA	Junior/Youth Program	Emerald	Private	50%
90100103	Claire Eugenia Khu	CEMARA	Junior/Youth Program	Camelot		
90100104	Hannah Sophia Salim	CEMARA	Junior/Youth Program	Diamond	Sergeant	80%
90100105	Angelica Makro	CEMARA	Junior/Youth Program	Topaz	Private	75%
90100106	M Rasya Dalimunthe	CEMARA	Junior/Youth Program	Topaz	Private	75%
90100107	Stoffel Swandeez Angkasa	CEMARA	Junior/Youth Program	Camelot		
90100108	Vergio Gavino Chaikoff	CEMARA	Junior/Youth Program	Amethyst	Private	100%
90100109	Jolin Thianda	CEMARA	Junior/Youth Program	Amethyst	Sergeant	30%
90100110	Cedric Max Osmond	CEMARA	Junior/Youth Program	Azurite	Private	63%
90100111	Victoria Chandra	CEMARA	Junior/Youth Program	Azurite	Private	63%
90100112	Richie Alvaro Tandinata	CEMARA	Junior/Youth Program	Azurite	Sergeant	20%
90100113	Reynard Shendior	CEMARA	Junior/Youth Program	Camelot		
90100114	Kate Elizabeth Huang	CEMARA	Junior/Youth Program	Amethyst	Sergeant	20%
90100115	William Lauda	CEMARA	Junior/Youth Program	Amethyst	Sergeant	100%
90100116	Janessa Hofang	CEMARA	Junior/Youth Program	Emerald	Private	100%
90100117	Jarell Hofang	CEMARA	Junior/Youth Program	Emerald	Private	75%
90100118	Jesslyn Hofang	CEMARA	Junior/Youth Program	Camelot		
90100119	No registration					
90100120	Jocelyn Sydney 	CEMARA	Junior/Youth Program	Topaz	Sergeant	30%
90100121	Aileen Alfina Susanto	CEMARA	Junior/Youth Program	Emerald	Private	50%
90100122	Tiffany Toh	CEMARA	Junior/Youth Program	Obsidian	Private	100%
90100123	Trevor Toh	CEMARA	Junior/Youth Program	Obsidian	Private	88%
90100124	Michael James Tantao	CEMARA	Junior/Youth Program	Amber	Private	25%
90100125	Matthew James Tantao	CEMARA	Junior/Youth Program	Quartz	Private	50%
90100126	Cherryl Angelia Sandy	CEMARA	Junior/Youth Program	Azurite	Private	50%
90100127	Davin Bradford	CEMARA	Junior/Youth Program	Azurite	Sergeant	20%
90100128	Dustin Bradley	CEMARA	Junior/Youth Program	Amethyst	Sergeant	10%
90100129	Jasmine Ryana Ngadimin	CEMARA	Junior/Youth Program	Avalon		
90100130	Maurice Claire Genevieve	CEMARA	Junior/Youth Program	Azurite	Private	25%
90100131	Gillian Natalie Wilfred	CEMARA	Junior/Youth Program	Sapphire	Private	100%
90100132	Louis Adrian	CEMARA	Junior/Youth Program	Obsidian	Private	100%
90100133	Josh Andrew	CEMARA	Junior/Youth Program	Amber	Private	75%
90100134	Rodrick Stefano Halim	CEMARA	Junior/Youth Program	Sapphire	Sergeant	100%
90100135	Rainie Lynn	CEMARA	Junior/Youth Program	Sapphire	Private	100%
90100136	Miho Qanitah Sihombing	CEMARA	Junior/Youth Program	Amethyst	Private	100%
90100137	Keiko Hanara Sihombing	CEMARA	Junior/Youth Program	Duloc		
90100138	Vyon Wynter Huang	CEMARA	Junior/Youth Program	Pearl	Sergeant	100%
90100139	Mikayla Seline Wu	CEMARA	Junior/Youth Program	Duloc		
90100140	Jadellyne Gretchenagatha Zhuotio	CEMARA	Junior/Youth Program	Amethyst	Sergeant	30%
90100141	Carrie Priscilla Figo	CEMARA	Junior/Youth Program	Jade	Private	50%
90100142	Priscilla Vidarlin	CEMARA	Junior/Youth Program	Sapphire	Private	38%
90100143	Jason Lewis Theo	CEMARA	Junior/Youth Program	Azurite	Sergeant	30%
90100144	Vincenzo	CEMARA	Junior/Youth Program	Quartz	Private	50%
90100145	Viona Bellavania Birgitta	CEMARA	Junior/Youth Program	Pearl	Private	25%
90100146	Selena Frederica Castalia	CEMARA	Junior/Youth Program	Obsidian	Private	38%
90100147	Griffin Theodoric	CEMARA	Junior/Youth Program	Jade	Private	50%
90100148	Kei Evander Buhari 	CEMARA	Junior/Youth Program	Diamond	Sergeant	10%
90100149	Stevanie Angel Gunawan	CEMARA	Junior/Youth Program	Sapphire	Private	63%
90100150	Graciella Wiselie	CEMARA	Junior/Youth Program	Amethyst	Private	50%
90100151	Warren Tandias	CEMARA	Junior/Youth Program	Azurite	Private	63%
90100152	Shirleen Nyrtle	CEMARA	Junior/Youth Program	Amethyst	Private	50%
90100153	Ethan Putra Gotama	CEMARA	Junior/Youth Program	Ruby	Sergeant	80%
90100154	Emmeline Aurelia Lie	CEMARA	Junior/Youth Program	Sapphire	Private	75%
90100155	Nathan Archie Gunawan	CEMARA	Junior/Youth Program	Sapphire	Private	50%
90100156	Nicole Anastasia	CEMARA	Junior/Youth Program	Pearl	Private	75%
90100157	Jean Kelly Samudra Tjuaja	CEMARA	Junior/Youth Program	Azurite	Private	25%
90100158	Gwen vidyatan	CEMARA	Junior/Youth Program	Sapphire	Private	63%
90100159	No registration					
90100160	Klarissa Evania Buhari 	CEMARA	Junior/Youth Program	Pearl	Private	100%
90100161	Harvey Taufik	CEMARA	Junior/Youth Program	Duloc		
90100162	Adrian Soh	CEMARA	Junior/Youth Program	Jade	Private	25%
90100163	Videline Gillian Chaikoff	CEMARA	Junior/Youth Program	Duloc		
90100164	Jarred Eldridge Tantama	TIMOR	Junior/Youth Program	Narnia		
90100165	Muhammad Alby Azka Lubis	CEMARA	Junior/Youth Program	Amethyst	Private	63%
90100166	Reinz Stythan 	TIMOR	Junior/Youth Program	Narnia		
90100167	Alicia Quinn chandranata	TIMOR	Junior/Youth Program	Narnia		
90100168	Madelyn Henryetta Fang	CEMARA	Junior/Youth Program	Pearl	Private	75%
90100169	Eleora Iskandar Liunardi	TIMOR	Junior/Youth Program	Narnia		
90100170	Viyona Gavriela Muis	CEMARA	Junior/Youth Program	Avalon		
90100171	Eileen Yui Chen	CEMARA	Junior/Youth Program	Avalon		
90100172	Michi Amira Sukmana	CEMARA	Junior/Youth Program	Obsidian	Private	25%
90100173	Jeneiro	CEMARA	Junior/Youth Program	Emerald	Private	38%
90100174	Otto Valerino Lim	CEMARA	Junior/Youth Program	Sapphire	Private	50%
90100175	Jovan Leonard Lui	CEMARA	Junior/Youth Program	Sapphire	Private	38%
90100176	Rahma Nakita Afifah	TRITURA	Junior/Youth Program	Atlanta	Private	25%
90100177	Dominica Cherish Sheiramoth	CEMARA	Junior/Youth Program	Duloc		
90100178	MIRACLE HUANG	CEMARA	Junior/Youth Program	Avalon		
90100179	Emily moraine hakim	CEMARA	Junior/Youth Program	Diamond	Private	63%
90100180	Jayden jiefferson	CEMARA	Junior/Youth Program	Emerald	Private	25%
90100181	Madeleine Cendana	CEMARA	Junior/Youth Program	Beryl	Private	
90100182	MAXWELL TENAR	CEMARA	Junior/Youth Program	Quartz	Private	63%
90100183	Heinz victorio zhou	CEMARA	Junior/Youth Program	Emerald	Private	63%
90100184	No registration					
90100185	Natasha Clairine Wu	CEMARA	Junior/Youth Program	Amber	Private	50%
90100186	Samantha Clairine Wu	CEMARA	Junior/Youth Program	Quartz	Private	100%
90100187	No registration					
90100188	Rebecca kelly ashari	CEMARA	Junior/Youth Program	Alexandrite	Private	25%
90100189	Abigail avery ashari	CEMARA	Junior/Youth Program	Duloc		
90100190	Daphne Nathania Ang	CEMARA	Junior/Youth Program	Alexandrite	Private	63%
90100191	Bosco Lim	CEMARA	Junior/Youth Program	Topaz	Private	88%
90100192	Jayden Jingga	CEMARA	Junior/Youth Program	Ruby	Private	50%
90100193	Tyra Louise Tohnika	CEMARA	Junior/Youth Program	Alexandrite	Private	38%
90100194	Tyler Howard Tohnika	CEMARA	Junior/Youth Program	Duloc		
90100195	Sarah Oktorela Sitorus	CEMARA	Junior/Youth Program	Jade	Private	38%
90100196	Jordan Philip Wihono	CEMARA	Junior/Youth Program	Ruby	Private	13%
90100197	Jeffrey Yap	CEMARA	Junior/Youth Program	Duloc		
90100198	Jordan Swiss Cliftan 	CEMARA	Junior/Youth Program	Topaz	Private	100%
90100199	Steve Mason	CEMARA	Junior/Youth Program	Avalon		
90100200	Galent hansen wuner	CEMARA	Junior/Youth Program	Azurite	Private	25%
90100201	Crystaline Angela indrajaya	TIMOR	Junior/Youth Program	Hogwarts		
90100202	Xavierra Kaylyn Leeon	CEMARA	Junior/Youth Program	Camelot		
90100203	Clarice Valenzka Wijaya	CEMARA	Junior/Youth Program	Duloc		
90100204	Chloe Wong	CEMARA	Junior/Youth Program	Jade	Private	13%
90100205	Bernice Wong	CEMARA	Junior/Youth Program	Camelot		
90100206	Metta Louise ellen	CEMARA	Junior/Youth Program	Azurite	Sergeant	100%
90100207	Darynne Clarabelle Yuan	CEMARA	Junior/Youth Program	Jade	Private	
90100208	Patricia	CEMARA	Junior/Youth Program	Amber	Private	38%
90100209	George 	CEMARA	Junior/Youth Program	Quartz	Private	25%
90100210	Wilbenzs Howard	CEMARA	Junior/Youth Program	Ruby	Private	13%
90100211	Callista Aurelia alven 	CEMARA	Junior/Youth Program	Jade	Private	13%
90100212	Quinn Rachel Liu 	CEMARA	Junior/Youth Program	Camelot		
90100213	Seabert Swandeez Angkasa	CEMARA	Junior/Youth Program	Camelot		
90100214	Louis kendrick	CEMARA	Junior/Youth Program	Obsidian	Private	13%
90100215	Phebe Lalita	CEMARA	Junior/Youth Program	Topaz	Private	25%
90100216	Jollyne Gretchenavery Zhuotio	CEMARA	Junior/Youth Program	Beryl	Private	
90100217	CHARLIE MIKKELSEN YAP	CEMARA	Junior/Youth Program	Azurite	Private	13%
90100218	Phebe Diorra Salim	CEMARA	Junior/Youth Program	Beryl	Private	
90100219	Destine Diorra Salim	CEMARA	Junior/Youth Program	Beryl	Private	
90100220	No registration					
90100221	Ryan Aurelio Bustamin	CEMARA	Junior/Youth Program	Jade	Private	13%
90100222	No registration					
90100223	Feodora Meidy Leandra	CEMARA	Junior/Youth Program	Diamond	Private	25%
90100224	Hillary Quinn	CEMARA	Junior/Youth Program	Atlantis		
90100225	Richelle lim	CEMARA	Junior/Youth Program	Azurite	Private	
90100226	GEORGE FENDISON	CEMARA	Junior/Youth Program	Avalon		
90100227	Richard Edbert Susantio 	CEMARA	Junior/Youth Program	Atlantis		
90100228	Hanson julio tanadi	CEMARA	Junior/Youth Program	Azurite	Private	
90100229	HEUGER LAY	CEMARA	Junior/Youth Program	Atlantis		
90100230	KYGO LAY 	CEMARA	Junior/Youth Program	Amber	Private	
90100231	Queenza Theodora Wijaya	CEMARA	Junior/Youth Program	Avalon		
90100232	Kathrine Chrestella	CEMARA	Junior/Youth Program	Pearl	Private	13%
90100233	Sam Lincoln Kane	CEMARA	Junior/Youth Program	Duloc		
90100234	Lionel evander jayadi	CEMARA	Junior/Youth Program	Beryl	Private	
90100235	Hermione Emmilia Artjim	CEMARA	Junior/Youth Program	Emerald	Private	13%
90100236	WINSTON XAVERIUS JUNIO	CEMARA	Junior/Youth Program	Azurite	Private	13%
90100237	Callista Aurora Welopo	CEMARA	Junior/Youth Program	Duloc		
90100238	Sean Alexio xanderv	CEMARA	Junior/Youth Program	Atlantis		
90100239	JOYXE ADELINE WISELY	CEMARA	Junior/Youth Program	Amber	Private	
90100240	Alpine Miler Luo	CEMARA	Junior/Youth Program	Atlantis		
90100241	Jeremy Arthur Anggriawan	CEMARA	Junior/Youth Program	Amethyst		
90100242	Beverly Mandy Tjoeng	CEMARA	Junior/Youth Program	Atlantis		
90100243	Ryuichi loury 	CEMARA	Junior/Youth Program	Beryl	Private	
90100244	Rozelle Xiera	CEMARA	Junior/Youth Program	Atlantis		
90100245	Mason Ivander Cahaya	CEMARA	Junior/Youth Program	Alexandrite	Private	13%
90100246	Felice limandar	CEMARA	Junior/Youth Program	Diamond	Private	
90100247	Garcia limandar	CEMARA	Junior/Youth Program	Atlantis		
90100248	Richie Wong Yon Chuang	CEMARA	Junior/Youth Program	Amber	Private	
90100249	Ahmad Hanif	CEMARA	Junior/Youth Program	Jade	Private	
90100250	Aldrich Smaver Tanasal	CEMARA	Junior/Youth Program	Quartz	Private	
90100251	Felix Austin Lumbantobing	CEMARA	Junior/Youth Program	Emerald	Private	
90100252	Alleluia Elyona Sitohang	CEMARA	Junior/Youth Program	Atlantis		
90100253	Ruby Faustin Amat	CEMARA	Junior/Youth Program	Atlantis		
90100254	Reagan Alberic Guntur 	CEMARA	Junior/Youth Program	Avalon		
90100255	Felicia Fransisca	CEMARA	Junior/Youth Program	Beryl	Private	`;

async function createAndPopulateReportActivity() {
  try {
    console.log('Creating table report_activity in PostgreSQL...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS report_activity (
        trainee_id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        branch VARCHAR(100),
        cleaned_program VARCHAR(255),
        cleaned_class VARCHAR(255),
        level VARCHAR(100),
        speaking_project_to_next_level VARCHAR(50),
        level_up_checklist TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Table report_activity created successfully.');

    // Clear existing data if re-running
    await db.query(`TRUNCATE TABLE report_activity;`);

    console.log('Parsing and inserting data into report_activity...');
    const lines = rawData.split(/\r?\n/).filter(l => l.trim());
    let insertedCount = 0;

    const chunkSize = 150;
    const records = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split('\t').map(c => c.trim());
      const trainee_id = cols[0];
      const name = cols[1];
      const branch = cols[2] || null;
      let cleaned_program = cols[3] || null;
      const cleaned_class = cols[4] || null;
      const level = cols[5] || null;
      const speaking_project_to_next_level = cols[6] || null;

      if (!trainee_id || !name || name.toLowerCase() === 'no registration') continue;

      // Replace "Junior/Youth Program" with "Core/Society Program"
      if (cleaned_program) {
        cleaned_program = cleaned_program.replace(/Junior\/Youth Program/gi, 'Core/Society Program');
      }

      records.push({
        trainee_id,
        name,
        branch,
        cleaned_program,
        cleaned_class,
        level,
        speaking_project_to_next_level,
        level_up_checklist: null
      });
    }

    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize);
      const valStrings = [];
      const params = [];

      chunk.forEach(r => {
        params.push(
          r.trainee_id, r.name, r.branch, r.cleaned_program,
          r.cleaned_class, r.level, r.speaking_project_to_next_level, r.level_up_checklist
        );
        const pLen = params.length;
        valStrings.push(`($${pLen - 7}, $${pLen - 6}, $${pLen - 5}, $${pLen - 4}, $${pLen - 3}, $${pLen - 2}, $${pLen - 1}, $${pLen})`);
      });

      const queryText = `
        INSERT INTO report_activity (
          trainee_id, name, branch, cleaned_program, cleaned_class,
          level, speaking_project_to_next_level, level_up_checklist
        ) VALUES ${valStrings.join(', ')}
        ON CONFLICT (trainee_id) DO UPDATE SET
          name = EXCLUDED.name,
          branch = EXCLUDED.branch,
          cleaned_program = EXCLUDED.cleaned_program,
          cleaned_class = EXCLUDED.cleaned_class,
          level = EXCLUDED.level,
          speaking_project_to_next_level = EXCLUDED.speaking_project_to_next_level,
          updated_at = NOW();
      `;

      const res = await db.query(queryText, params);
      insertedCount += chunk.length;
    }

    console.log(`Successfully populated ${insertedCount} records into report_activity!`);

    // Sample output verification
    const sample = await db.query(`SELECT * FROM report_activity LIMIT 3;`);
    console.log('Sample report_activity rows:', JSON.stringify(sample.rows, null, 2));

  } catch (err) {
    console.error('Error importing report_activity:', err);
  } finally {
    process.exit(0);
  }
}

createAndPopulateReportActivity();

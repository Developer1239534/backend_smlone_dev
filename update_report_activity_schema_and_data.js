const db = require('./src/db/neonClient');

const rawLifeProjectData = `ID	Name	Life Project to Next Level
20	Nicholas Matthew Halim	0%
21	Novriciella Carina Luthan	0%
22	Candice Chrystalline Liangrich	0%
23	Jivaka Putra	0%
24	No registration	0%
25	Erich Legolas Cen	0%
26	Bryan Legolas Cen	0%
27	Valerie Legolas Cen	14%
28	Raynard Fausta	100%
30	Chris Yochanan Wu	0%
31	Hans Sozo Wu	0%
32	Jacqueline Tjia	71%
33	Candise Natalie	0%
34	Megan Pindian	0%
35	Jesslyn Odelia Thio	0%
36	Giselle Titania	0%
37	Keona Jane Viriya	0%
38	Jave Liong	0%
39	Ryanne Shiven	0%
40	Jesaya Tara	0%
41	Clement Sanusi	0%
42	Aaron Sebastian Willson	0%
43	Petra Zoe Khoman	0%
44	Stella Edlyn Kwok	0%
45	Aaron Goldwin Semarak	86%
46	Marco Freddie Tjiaren	0%
47	Martin Leandro Limero	0%
48	Justin Maxwell	0%
49	Richmond Osyan Sudilan	0%
50	Kenichi Zhou	0%
51	Cedric Yago	100%
52	Cheryl	0%
53	Arilynn Wijaya	0%
54	Grisvian Tandy	100%
55	Justin Rusly	0%
56	Filbert	0%
57	Averina Liv Valerie Moiras	86%
58	Brentnico Chen	0%
59	Raynald Yu	0%
60	Sharleen Velicia Lim	0%
61	Kenneth Aurelio Bustamin	0%
62	Stephanie Ivana Salim	0%
63	Cleona Vivienne Lim	0%
64	Jillian Rusly	0%
65	Gelsey Megan Chaniya	0%
66	Ivaldo Juanda	0%
67	Claryce Annabelle Yu	0%
68	Othniel Rolando Manson	0%
69	Vivian Khu	0%
70	Selly Salim	0%
71	Amanda Gracie Onggo	0%
72	Kimberly Howanta	0%
73	Jason Marco	0%
74	Ariel Lucius	0%
75	Paul Simanjuntak	0%
76	Michael Cahyadi	0%
77	Valerie Doreen Kwerier	0%
78	Valerie Ann	0%
79	Madeleine Lee	0%
80	Neo Freddiego Chen	0%
81	No registration	0%
82	Nicole Mila Khoman	0%
83	Nicholas Siregar	0%
84	Naomi Siregar	0%
85	Shafira Gladys	0%
86	Elysia Pasaribu	0%
87	Ellyse Sigalingging	0%
88	Nehemia Asadika Tumogihon Saragih	0%
89	Chelsea Grace Cantika Pasaribu	0%
90	Kayla Udrey	0%
91	Dave Meliala	0%
92	Carissa Meliala	0%
93	No registration	0%
94	Flint Oliver	0%
95	Wilbert Hartianto	0%
96	Hudson Fulviano Sentosa	14%
309	Luiz Alvaro Diego	0%
331	Vellica Benarissa Tanjaya	0%
339	Ellen Angelica	0%
29	Muhammad Athallah Rafif Ulhaq	0%
125	Jayxen Maxwell	0%
128	Felice Naomi Tjiaren	29%
126	Ellwed Layrence	0%
127	Stefan Song	0%
132	Morris Claudius	0%
129	Suci Nurhaliza	0%
130	Anastasya Sofie Yohan	0%
133	Oedia Ruth Vania	0%
134	Madeline Lim	0%
135	Celine Meganz Wijaya	0%
136	Claudine Joshanley	29%
137	Jovian Livio	0%
140	Walfred Aurelio Wijaya	0%
141	Russell William Tanner	71%
139	Johnson Tanako	0%
138	Bryan Frederick Wijaya	0%
144	Reagan Maxzen Kanawa	0%
147	Jovianne Christa Xie	0%
145	Josh Brian Setiawan	0%
146	Raymand Wilbert Wijaya	0%
148	Bryan Velerian	0%
149	Elaine Velicia	43%
151	Kenshiro Leowardy	0%
152	Welton Padmoasmolo	0%
290	Daniel Maranello Winata Winata	0%
234	Jacky Wu	0%
236	Calvin Wijaya	0%
238	Venesya Evelyn Tiawan	0%
239	Shania Josevine	0%
240	Ricko Wu	0%
241	Revandeiss Putrameka Beruh	0%
246	Brianne Antoniette Wibowo	0%
247	Bernice Annabelle Wibowo	0%
248	Jayden Matthew Joe	0%
249	Emily Santo	14%
250	Ryan Eagan Cendana	0%
261	No registration	0%
266	Felicia Tjiawijaya	0%
272	Jocelyn Basirun	0%
273	Joy Tan	0%
274	Candice Winardi Wong	57%
275	Eugenia Joanne Kie	0%
276	Florencia Oria	0%
410	Dyra Muntazsirah	0%
286	Jocelyn Oria	0%
287	Starlin Oria	0%
288	Carisle Vee Lovel	0%
291	Darrell Richard Sen	0%
292	Dylan Raynald Sen	0%
293	Felice Meganz Wijaya	0%
302	Eduardo Bingei	43%
303	Lucas Zhang	0%
304	Louis Zhang	0%
306	Rowen Reynaldo	0%
308	Nicholas Yanwar	0%
310	Warren Voss Khoman	0%
318	Ellena Jocelyn Lasiman	0%
320	Andrene Metta Leo	0%
321	Devan Angkasa	0%
322	Eagan Hsiao	0%
324	Yujiro Cokro	0%
328	Jessica Evangeli Tjiawijaya	0%
329	Vrederick Benaricco Tanjaya	0%
330	Avril Valerie Tjhe	0%
332	Carlisse Anastacia Liang	0%
333	Jasmine Yenarti	0%
334	Milliana Joan	0%
335	Kathleen Maria Isabel Sagala	0%
342	Louiselynn Nurimba	0%
368	Felice Vallerie Angkasa	14%
374	Clarice Aurelia Fuwynn	0%
380	Valerie Jeanne Mandera	0%
390	Maximilian Evan Tanujaya	0%
393	Jelysha Soekendar	0%
394	Jemiko Soekendar	0%
395	Maverick Winata	0%
396	Matthew Candiof	0%
398	Elbert Reagan Tevix	0%
399	Shannon Calista Tevix	0%
400	Richard Axel Tjhe	0%
405	Graciella Madeline	0%
433	James Oliver Neoman	29%
438	Brielle Xaviera	0%
440	Sofia Grace Wu	100%
441	Kenzie Fernando Hugh	0%
491	Audrey Theona Law	0%
499	Halisna Ronauli Sinaga	0%
511	Amarissa	0%
512	Fione	0%
513	Anabell	0%
517	Jack Travis Lee	0%
518	Joe Jasper Lee	0%
519	Valencia Wibowo	0%
520	Falen Novelie	57%
521	Taryn Tjan	14%
525	 	0%
528	Kiery Keionna Kie	14%
529	Rodrique Owen Salim	0%
530	Lewellyn Chen	0%
531	Max Chen	0%
532	Yasmin Fadhila Azzakiyah	0%
533	Iffah Nabila Rahmad	0%
534	Izzatun Nada Azzakiyah	0%
535	Harbert Ivander	14%
536	Sky Alexander Kwan	0%
537	Sunshine Angelia Kwan	0%
538	Graciella Madeline	0%
539	Giselle Ng	0%
540	Valencia -	0%
541	Enzo Aldridge Teh	71%
542	Lionel Aston Wang	0%
543	Stacey Carina Lim	0%
544	Jolyn Yuvina	0%
545	Brandon Chiang	0%
546	Adelynne	0%
237	Madeleiene Gelwaz	0%
255	Denzel Geraldo Wijaya	57%
267	Darren Gerrard	0%
268	Freya Anastasia Chendry	0%
269	Fresia Victoria Chendry	0%
270	Bonfilio Timothy Kosma	0%
271	Christopher Aaron Imanuel Indrawan	0%
280	Dylan Huang	0%
283	Callista Abigail Suryawijaya Suryawijaya	0%
284	Callysta Harly Huang	0%
285	Clairine Joshanley	57%
289	Celine Valeri Hakim	0%
294	Katherine Argerikh Winata Winata	0%
295	Liv Agatha Jolie	0%
301	Chloe Zhou	0%
307	Josh Derrick Phen	0%
336	Jose Keiyabes Sagala	0%
341	Matt Stanley Chua	0%
375	Darren Gabriel	71%
376	Elainne Callista Miracle	0%
377	Jason Clein Halim	0%
378	Samuel Ancillo Miracle	0%
379	Cathelyn Basirun	0%
381	Fiorentino Lee	0%
391	Aurelia Caitlyn Tanujaya	0%
418	Aristo Wiley	0%
423	Felysse Auryn Khobert	0%
425	Kentrick	0%
426	Selby Cen	0%
429	Charrelle Anthony	100%
431	Justine Limurti	0%
435	Alvendi Tanio	0%
436	Braven Suryadi	0%
437	Sheldon Suryadi	0%
442	Beatrys Vanesa Moiras	0%
443	Candyce Valezka Moiras	0%
445	Sherlyn Mireil	0%
446	Victoria Juhana	0%
472	Stuart Tjuatja	14%
475	Jacinda Viorenza Valentina	43%
476	Justin Rich Limilo	0%
477	Jovetta Kiyomi Limilo	0%
478	Gracelyn Lawrence	14%
479	James Brian Fan	14%
480	Jennice	0%
482	Reizo Kazuo Wong	100%
483	Jolie Charlotte Huang	0%
484	Arcelio Winston Laurence	14%
485	Grace Ignasia Batubara	0%
486	Nakin Ben Cuseline	100%
487	Edward Putra Limtama	0%
488	Khansa Tabita Sakhi	0%
490	Shane Ferrucio Lim	14%
493	Davian Anders	0%
494	Arsene Eldwen	0%
495	Celine Manuela Aritonang	0%
497	Joyceline Fidella Aquinamora Marpaung	0%
498	Jordan Alexander Lim	29%
501	Jocelyn Chloe Chandra	0%
503	Wayne Lincoln Tansley	0%
504	Wyatt Benjamin Tansley	0%
506	Clarabella	0%
507	Abelvinco	0%
508	Aldin Roi Angkasa	57%
547	Winson Natio	0%
548	Fiona Candiof	0%
549	Clairine Kimberly	0%
550	Vania Keinarra Handoko	0%
551	Ryuichiro Leowardy	0%
552	Brian Lim	0%
553	Florencia Hewi	0%
554	Brendi Lim	0%
555	No registration	0%
556	Lewis Darren Huang	29%
557	Richelle Erica Luhur	0%
558	Alysa Roberta Luhur	0%
559	Quinetta Pearl	29%
560	Ruiz Stythan	14%
561	No registration	0%
562	No registration	0%
563	Fellicia Lawrence	86%
564	No registration	0%
565	No registration	0%
566	Jollyn Felicia Wong	0%
567	Benediva Boaz Ambarita	0%
568	Carlista	0%
569	Josevin Carel H.	14%
570	Cherish Daniella Lee	0%
571	Aurelle Sophie Kesuma	43%
572	No registration	0%
573	Alvaro Richie Theus	0%
574	Brandon Tiojaya	0%
575	Mandy Ellen Sanusi	0%
576	Joanne Wong	14%
577	Jovanna Wong	43%
578	Marvel William	0%
579	Wilbert Tanaya	14%
580	Vivienne Zheng	0%
581	Nicholas Zheng	0%
582	Ethan Aldrich Lie	14%
583	Yuvrelyn Edren Yie	0%
584	Ivann Raphael Ohary	0%
585	Harvey Wijaya	0%
586	Annabella Wijaya	0%
587	Enrico Victorian	0%
588	Vallerent Viquel	0%
589	Aisyah Farah Setia Ixora	0%
590	Zadden Tanaya	0%
591	Joyce Mirabel Ng	57%
592	Marcelys Salim	0%
593	Houdrick Angelico	0%
594	Harleen Angelic	0%
595	Kathryn Jeslyn	14%
596	Nevaeh Ferry	0%
597	Stuart Hayden Tay	0%
598	Mario Aretha Ui	0%
599	Nadya Aretha Ui	0%
600	Gyan Lucero Joenardi	57%
601	Mikaella Hutteleigh Ng	43%
602	Alexandra Joan Micheline	29%
603	Max Viandi	0%
604	Hugo Viandi	0%
605	Philbert Charlin	0%
606	Stella Fredella Teoh	0%
607	Gilbert Charlin	0%
608	Ava Katarina Tjhe	0%
609	Rebecca Xie	71%
610	Josh Frederric Ang	0%
611	No registration	0%
612	Madelyn Chloe Wong	29%
613	Junior Auson Halim	0%
614	Rayden Chiang	0%
615	Louis Anthony Shen	14%
616	Sean Bryant Wong	0%
617	Channelle Kimberley Wong	0%
618	Yamin Yenardo	0%
619	Gilbert	29%
620	Sierra Conrad	0%
621	Ufaira Tiandra Dalimunthe	0%
622	Zahra Ghaniyah	0%
623	Angelina Setyawan	0%
624	Michael Setyawan	0%
625	Audrey Hartono Lee	29%
626	Alawi Ali Zumaini	86%
627	Vin Maxwell	0%
628	Heidi Mikaela Tenggara	0%
629	Joey Frederica Ang	29%
630	Nichole Gabrielle Santoso	0%
631	Queency Joycelyn Yieginia	57%
632	Clarisa Valencia Khomala	43%
633	Fiona Jolys Chong	0%
634	Glory Esther Simanjuntak	0%
635	Hillary Kayra Orsontio	0%
636	Zia Arafa Khairina	14%
637	Celine Cheng	14%
638	Chloe Olivia Ruslie	29%
639	Bianca Olivia Ruslie	0%
640	Amelia Laurence	86%
641	Emily Audrie Pannata	0%
642	Feligio Beatryan Wijaya	43%
643	Bilson Nobleyu	0%
644	Marson Nobleyu	0%
645	Marsha Ava Kaylana	0%
646	Felivia Riandy	0%
647	Celine Hadian	43%
648	Sarah	0%
649	Geraldine Caitriona Saimen	0%
650	Quintus Aurelio Tjhe	29%
651	Ashley Claire Lorence	71%
652	Michelle Budiman	0%
653	Jermaine Eldwen	14%
654	Rayden Oh	0%
655	Euan Benson Pranoto	0%
656	No registration	0%
657	No registration	0%
658	Hugh Rhys Holiverz	14%
659	Kimberlyn Alexis Holiverz	0%
660	No registration	0%
661	Alexa Ellane	0%
662	Clayton Komar Kok	0%
663	Jacqueline Simpson	29%
664	Chloe Valerie	0%
665	Khoo Shu Han	0%
666	Khoo Kwang Wei	14%
667	Khoo Kwang Chen	14%
668	Richelle Shiven	0%
669	Veraldo Valentino Rusli	0%
670	Christian Anderson Lee	0%
671	Chloe Bernice Tan	71%
672	Arissa Wijaya	43%
673	Nathan Immanuel Winanto	14%
674	Lorabelle Leon	14%
675	Maxen Zo Leon	71%
676	Grace Alexandra	71%
677	Olivia Florence Loesin	14%
678	Zoey Fiona Loesin	0%
679	Fiorenza Eleanor Wijaya	0%
680	Gracelyn Yap	0%
681	Vanessa Sonata	0%
682	Jocelyn Ryu Kaylee	14%
683	Stanley Ace Lorence	0%
684	Chayden Yavier Chu	0%
685	Cherlyn Yaviera Chu	14%
686	Owen Linwood	0%
687	Philipp Torrien Chandra	14%
688	Evelynn Belle Wunanda	29%
689	Russell Ang	0%
690	Raynard Ang	0%
691	Vanessa Claire Wunanda	29%
692	Alyssa Anne Wunanda	43%
693	No registration	0%
694	No registration	0%
695	No registration	0%
696	No registration	0%
697	Ruby Lie	14%
698	Jason Maverick Tan	0%
699	Audrey Pheng	0%
700	Galen Lawden	0%
701	Louisya Nistriora Manalu	0%
702	Rayzellvion Edren Yie	0%
703	Stacy Kho	0%
704	Morgan Valentino Lowis	0%
705	Grace Vania Susanto	0%
706	William Arthur Tjuatja	0%
707	Samho Gunawan	0%
708	Dixen Andersen	0%
709	Winston Lawrence	0%
710	Ethan Jae Ongko	0%
711	Leon Walter Zhu	0%
712	Ilona Freya Zhu	0%
713	Ferguson Gohardjo	0%
714	Delphine Adeline Bellinda	14%
715	Ken Os Lim	0%
716	Chloe Vallerie Jie	29%
717	Dmitri Meddef Njo	0%
718	Clara Glory Xie	0%
719	Davar Aly Harahap	0%
720	James Richley Qiu	0%
721	Jarred Qiu	0%
722	Enzo Witton	86%
723	Jolin Rochelle Chen	0%
724	No registration	0%
725	No registration	0%
726	Renzo Tanaka	71%
727	Edeline Wisely	0%
728	Venagneisa Van Grinsven	0%
729	Carissa Aurelia Wylie	0%
730	Felice Edly Liauwin	29%
731	Nicole Alicia Tan	0%
732	Edward Liu	0%
733	Anindya Iftitah Lubis	0%
734	Jillian Alessandra Tjhe	0%
735	Kenward Melvern Djohan	0%
736	Kendrick Melvern Djohan	14%
737	Zivanna Quenby Boey	0%
738	Adeline Njo	0%
739	Zoefiker Putera Ngadiman	0%
740	Aubree Lisman	0%
741	Brayden Lisman	57%
742	Zavelyn Marpauli	43%
743	Nathanael Shawn Alexander	0%
744	Vianne Renata Lim	43%
745	Jesslyn	0%
746	Jocelyn Leman	0%
747	Jacklyn Feliska Hasan	0%
748	No registration	0%
749	Jocelyn M Yasmine Parhusip	0%
750	No registration	0%
751	Howie Chan	0%
752	No registration	0%
753	Eugene Matthew	0%
754	Reagan Khei Subroto	0%
755	Sherly	14%
756	Callista Sumono	0%
757	Jeanice Madeleine Kwok	29%
758	Sofia Lukman	0%
759	Warren Emanuel	0%
760	Richard Zheng	0%
761	Richelle Zheng	0%
762	Hogan Calixto Huang	14%
763	Safira Reynia Hanum	86%
764	No registration	0%
765	No registration	0%
766	Frincelia Wijaya	0%
767	Theodore Joachim Wihardjo	71%
768	Josh Seravino Zhang	0%
769	Joyce Yang	0%
770	Emma Gozali	0%
771	Jileen Chen	0%
772	Joleen Chen	0%
773	No registration	0%
774	No registration	0%
775	Clarissa Amberlyn	0%
776	Eason Niklaus	14%
777	Audrey Victoria Lim	0%
778	Christian Beryl Sinuhaji	0%
779	Jayden Tarmidi	0%
780	Steven Nicholas Halim	0%
781	Savannah Zoe Wijaya	0%
782	Hana Sophia Alice	0%
783	Evelynn Lee	0%
784	Garrix Ardent Putra	57%
785	Kelly Alyse Tanary	0%
786	Shelline Sutanto	0%
787	Shahnaz Shirendia	29%
788	Mhd Farid Athallah Hasibuan	14%
789	James T Chandra	0%
790	Hardey Moeldoko Law	43%
791	Eduardo Xaviero Bingei	0%
792	Hubert Bryan	29%
793	Grace Kelly	29%
794	Judyth Annabelle Naulibasa	14%
795	Avelynn Wijaya	43%
796	Ashton Howie	14%
797	No registration	0%
798	No registration	0%
799	Meredith Adlian	0%
800	Xavier Orlando Boe	14%
801	Hillary Calista Tamado Panjaitan	0%
802	Arthur Kendrick Zhuang	0%
803	Lovea Fendy Kho	43%
804	Rebecca Iewanto Xu	0%
805	Jevan Sean Vertio	57%
806	Efrata Iskandar Liunardi	29%
807	Tristan Jacob	14%
808	Gareth Brilliant Lim	14%
809	Emilia Niko Nyoman	71%
810	Jayden Tanadin	0%
811	Arthur Floyd Salim	29%
812	Lorenzo Margo Jap	0%
813	Kimmy Tjanaka	0%
814	Navarro Lim	0%
815	Alicia Oranie Depari	0%
816	Victoria Alberta Zheng	0%
817	Nicho Chandra Vimalanetra	43%
818	Naomi Alexis Supangat	0%
819	Maria Jill Lumbantoruan	0%
820	Alexander Alberta Zheng	0%
821	Vallerio	0%
822	Clarissa Olivia Anne Lammora Panjaitan	0%
823	James Bryan Tantono	0%
824	Septiana Katelyn Sharon Sinaga	0%
825	Grace Elizabeth	0%
826	Darren Wilson	0%
827	Aldrich Reynard Atmadi	0%
828	Elvano Reynard Atmadi	0%
829	Zhafir Gantari	29%
830	Justin Junior	0%
831	Ryan Hugo Purnomo	0%
832	Allessandra J Lee	14%
833	Quin Adrianna	14%
834	Mario Charlie	0%
835	Finn Aldrich Luman	0%
836	Kent Arthur Luman	0%
837	Clairine Angela Indrajaya	100%
838	Louis Harvey Soesanto	0%
839	Caitlyn Bianca Tjiaman	0%
840	Cullen Brian Tjiaman	0%
841	Jocelyn Jolie Tainiady	0%
842	Ethan Moeritz	14%
843	Jenessa Effendy	14%
844	Callista Stacy Lim	43%
845	Wallace Evencio	0%
846	Stevaldo Verino Oursun	86%
847	Claudia Catherine	0%
848	Ethan Fernandez Yap	0%
849	Wilbert Limin	0%
850	Karin Destynsia	0%
851	Tiffany Taniwan	14%
852	Cellistia Cangdiago	0%
853	No registration	0%
854	Chiara Vallerie Jie	0%
855	Cayden Louis Auwrich	29%
856	Carissa Catherine	0%
857	Hogan Chan	14%
858	Delmond Osyan Sudilan	71%
859	Clarissa Kho	14%
860	Michelle Yap	0%
861	Cyndi Ramaly	0%
862	Calvin Ramaly	14%
863	Bonita Gaudeti Sinaga	29%
864	No registration	0%
865	Victoria Yap	0%
866	Carlsen Simen	14%
867	Cherlyn Simen	29%
868	Sergio Garcia Ang	0%
869	Fleurette Celestine Lee	0%
870	Karen Hazel Liu	0%
871	Ryant Anthoney Lim	0%
872	Kenneth Samuel Lim	0%
873	Ozil Ramadhan Hutasuhut	0%
874	Muhammad Rafli Arkan	86%
875	Clarissa Fredelyn Jeoh	0%
876	Jacqueline Vallerie Chen	0%
877	Jenica Zealand Feng	29%
878	Bianca Maldiva Feng	14%
879	Jolin Vander Cia	0%
880	Joel Edward	14%
881	No registration	0%
882	Justin Chen	14%
883	Joanne Lynch	57%
884	Starley Valero Gozali	14%
885	Skylar Valdesto Gozali	14%
886	Jazzlyn Javeni	0%
887	Filia Cielo Lim	0%
888	Celine Chastine Angkasa	0%
889	Madelyn Odelia Lowis	0%
890	Eunice Grace	14%
891	Jayxvier Keegan Chuwardi	0%
892	Edward Nursalim	0%
893	Prajna Nursalim	14%
894	Sudatta Nursalim	0%
895	Michelle Angelina Yip	0%
896	Nicolas Carlie Kuwira	29%
897	Valerie Ivana Chen	0%
898	Ricson Stanlay	0%
899	Jay Ven	0%
900	Nicole Carmen Chang	0%
901	Elaine Velicia	0%
902	Malcolm	0%
903	Harvey Oliver Lee	0%
904	Callista Aurelia Tasma	0%
905	Carissa Aurelia Tasma	43%
906	Dario Oscar Zhong	0%
907	Emma Valerie Pang	0%
908	Averynn Marcia Pang	0%
909	Keona Jaileynn Lawrence	100%
910	Michael Thamida	0%
911	Meivellynn Thamida	0%
912	Alfred Benyamin Leidin	0%
913	Roselie Kirana Wijaya	29%
914	Leia Kaytlyn Tioe	100%
915	Rachel Darlyn Udjaja	43%
916	Valentino Nauli Basa	0%
917	Harlex Tjengdekia	0%
918	Fayee Abqaira Putrigian Sinambela	0%
919	No registration	0%
920	No registration	0%
921	No registration	0%
922	Victoria Cenata	0%
923	No registration	0%
924	Ethan Elka Suyento	0%
925	Quinn Felicia Foo	43%
926	Arthur Ignatius Carrari	0%
927	Richela Stanlay	14%
928	Victoria Roesli	0%
929	Trevor Hartono Lee	0%
930	Celine Nichola Xie	14%
931	Zealand Charvi Nathang	14%
932	Olivia Tjoa	14%
933	Ivy Jeane Chanella	0%
934	Zac Anthony Chua	0%
935	Gisella Nyoto	43%
936	No registration	0%
937	Jillian Claire Kuanrius	14%
938	Reagan Nyoto	43%
939	Rexcaden Jazper Shu	0%
940	No registration	0%
941	No registration	0%
942	Elaine Viandi	0%
943	No registration	0%
944	Kent Aldrich Huang	43%
945	Angeline Felice Theo	0%
946	Ryufin Junus	0%
947	Nayyara Ayaskara Prakasita	29%
948	Erick Winner Teo	0%
949	Amelia Irawan	14%
950	Audrey Madison Loewe	71%
951	Mavin Jericho Phen	0%
952	Louis Alvaro Wang	14%
953	Chloe Valencia Wang	0%
954	Ammiel Malikha Lamria	71%
955	Naomi Grace Edward	0%
956	Aileen Sophie Kesuma	14%
957	Rafifa Aisha Mahira	0%
958	Raisya Putri Raharjo	0%
959	Aleyna Chandra	0%
960	No registration	0%
961	No registration	0%
962	Ananda Putera Ngadiman	14%
963	Yasmina Athirah Rifqi	57%
964	Yazeed Abizar Rifqi	0%
965	Modric Agusta Daruma	14%
966	No registration	0%
967	No registration	0%
968	Lady Valery Sinambela	29%
969	Jordan Keegan	43%
970	Annabela Himeko Winarta	0%
971	No registration	0%
972	Darren Javier Wu	0%
973	No registration	0%
974	No registration	0%
975	No registration	0%
976	No registration	0%
977	Micha Belle Tan	0%
978	Clara Jill Valerie	14%
979	No registration	0%
980	Ezio Lim	43%
981	Joey Milan Phen	0%
982	Abigail Hazel Tamin	0%
983	Jashton Tokyo	0%
984	Chaden Ettienne Halim	0%
985	No registration	0%
986	Jason Allen Tjoa	0%
987	Caren Pandiago	0%
988	Gavyn Wijaya	43%
989	Federico Fredelyn Jeoh	0%
990	Zason Riady Ko	0%
991	Arya Kho	100%
992	James Ananda Wijaya	86%
993	Miranda Belle Tan	0%
994	Valisha Sofi Tjandra	14%
995	Qori Putri Syahviah	0%
996	Venesia Anggini Purba	0%
997	Jovin Limcoln	0%
998	Fedrick Wijaya	0%
999	Annabelle Grace Wu	43%
1000	Chloe Sinjaya	0%
1001	Hanson Nicolas Chandra	86%
1002	Hubert Ulrich Tan	0%
1003	Arthur Alexander Hakim	14%
1004	Vederrick Ethan Jap	0%
1005	Gisella	0%
1006	Jerico	29%
1007	Davina Grace Ong	0%
1008	Sydney Princessa Lim	0%
1009	Felicia Grace Ong	14%
1010	Gracielle Grace Ong	29%
1011	Clarence	0%
1012	Clarence Aurelia Colim	0%
1013	Michelle Kalyani	29%
1014	Catherine Gotami	0%
1015	Fransisca	0%
1016	No registration	0%
1017	Harvardo Lovenzo Susanto	29%
1018	Freddy Salim	0%
1019	Louis Clinton Chai	14%
1020	Caren Axella Natania Lumbantoruan	14%
1021	No registration	0%
1022	Efraim Lucas Dimitri	0%
1023	Darryl Raynold Leowe	86%
1024	Chloe Audrey Chen	0%
1025	Hermione Lovely Susanto	57%
1026	Angelina Novita Chandra	0%
1027	Elnino Jehanra Saragih	0%
1028	Darren Winston	43%
1029	Luna Antoinette Linne	14%
1030	Valerie Rosalyn Yap	29%
1031	Jacques Lewinsky	0%
1032	Joey Celine	14%
1033	Shelvina Howie	0%
1034	Cherryl Riquelme Potan	57%
1035	Adeline Luhur	43%
1036	Verencia Alden	43%
1037	Caitlyn Allison Yaphen	0%
1038	Devon Jau	57%
1039	Naafa Maisyva Ginting	0%
1040	Shane Anastasya Kristy Simangunsong	0%
1041	Chloe Taydey	0%
1042	Maydelyn Zhang	14%
1043	Kenrich Thantio Yangderson	0%
1044	Dominic Kie	14%
1045	Silvario Soedidjo	0%
1046	Max Wayne Subroto	29%
1047	Jordan Tanutama	0%
1048	Reynard Lis	43%
1049	Rafael Maximillian Sitorus	0%
1050	Galang Roland Besch	0%
1051	Timothy Anwi Panca	0%
1052	Carlene Yang	0%
1053	Elaine Clemence Annabell	14%
1054	Renata Allie Rusli	0%
1055	Reginald Ali Rusli	0%
1056	Yeslin Yap	86%
1057	Louis Xavier Leonardi	0%
1058	Gracia Tiffany Susanto	0%
1059	Meuthia Gadiza	0%
1060	Zac Aldrich Mayor	14%
1061	Kayden Skylar Sanso	0%
1062	Queensya Lovely Reya	0%
1063	Nicole Beh	43%
1064	Morgan Beh	0%
1065	Maxwell Louis Jaya	0%
1066	Samuel Christopher Halim	0%
1067	Richester Casvio Liong	0%
1068	Hiero Haydenzo Huang	0%
1069	Kartrine Sathya Felim	43%
1070	Krishna Dhammo Felim	29%
1071	Chloe Aurelia Ten	86%
1072	Hazel Natalie Ten	0%
1073	Scarlett Avery Ten	0%
1074	Ayska Najya Prakasita	0%
1075	Bryan Michael Ng	0%
1076	Brayden Matthew Ng	0%
1077	Alqueenza Syifa Winona	0%
1078	Ethan Kenny Daruma	43%
1079	Keigo Kusuno Soh	0%
1080	Reynara Amber Koiman	0%
1081	Carlton Kho	43%
1082	Davin Obert Khoo	0%
1083	Gillian Alexa Pearl	0%
1084	Leonard Nyoto	0%
1085	Garent Nyoto	0%
1086	Kayden Ethan Zhou	0%
1087	Nicole Eunice Lautan	0%
1088	Alesha Sofia Andhika	0%
1089	Jessica Jo	0%
1090	Healey Tjoe	43%
1091	Jennifer Othniella Situmorang	57%
1092	Jill Madison Ali	14%
1093	Annastasia Hideko Winarta	0%
1094	Howard Richer Thia	0%
1095	Regina Fortuna Amal	0%
1096	Maxwell Kenson Wibisono	0%
1097	Reia Rose Winfield	0%
1098	Naia Sydney Winfield	0%
1099	Cleva Levica	0%
1100	Khansa Salsabila	0%
1101	Fredella Alexa Maranggi Siregar	0%
1102	Adhyasta William Nugroho	0%
1103	Nicholas Tjin	0%
1104	Abbygael Mikaela Tangelyn	0%
1105	Keiko Aiby Lim	0%
1106	Vierra Cleevany Ryu	29%
1107	Gwyneth Louisa Yap	29%
1108	Zea Alesha Rizki	0%
1109	Princess Latheefa Azzura	0%
1110	Aaron Yang	0%
1111	Howie Leonard Wijaya	0%
1112	Maynard Jeremiah Simarmata	43%
1113	Joe Benedict Japto	0%
1114	James Tjoa	0%
1115	Reagan Oliver Zhuang	0%
1116	Kim Megumi	0%
1117	Claire Gabrielle Oscar	0%
1118	Reagan Thierry Wijaya	0%
1119	Andrea Dimitri Ashraafi Lazzaroni	0%
1120	Reynand Wijaya	0%
1121	Liam John Rickson	0%
1122	Leeanne Jane Lim	0%
1123	Joequinn Felysse Warsono	0%
1124	Felicia Liangso	0%
1125	Grace Anastasia Zeng	0%
1126	Yedidyah Mikaela Erina	0%
1127	Edric Luiz Ongka	0%
1128	Lashira Awbinsriee Pane	0%
1129	Stephanie Evelyn Luo	0%
1130	Ethan Ray Maxwell	0%
1131	Vinxiero Carrick Francoiz	0%
1132	Nicole Lee	14%
1133	Natalie Willeen Zhang	29%
1134	Kent Nanda Daruma	0%
1135	Cherysse Auryn Khobert	14%
1136	Ernesto Zedden Wirawan	0%
1137	Celine Angeline Yiandri	0%
1138	Mike Louis Wijaya	0%
1139	Wilbert Wijaya	0%
1140	Keita Raelyn Deng	0%
1141	Joyce Nathania Shen	0%
1142	Oscar Linwood	0%
1143	Rico Alvaro Chandra	0%
1144	Kayla Shilyn Gani	0%
1145	Gallen Yuman King	0%
1146	Charis Yafa Tobing	14%
1147	Calista Kasih Aprilia Harahap	29%
1148	Talysha Sri Nayla	14%
1149	Arnold Alexander Hakim	0%
1150	Kellyn Chandra	0%
1151	Theona Zefanya Purba	0%
1152	Javerson Joshua Tobing	0%
1153	Philippe Benedict Zhuang	14%
1154	Aca Raymond Tjemerlang	0%
1155	Howard Winston Louis	14%
1156	Alika Zelmira Wibowo	14%
1157	Gywen Stefanie Wiley	0%
1158	Kendrick Eoghan	0%
1159	Kezia Zenitha Sinaga	0%
1160	Karen Kallenia Sinaga	0%
1161	Randa Miracle Boasly Sihombing	14%
1162	Carine Susanto Lie	0%
1163	Azarine Apriza Darmawan	0%
1164	Felicia Ivana Silalahi	29%
1165	Madeline Lauren	0%
1166	Anderson Putra Supama	0%
1167	Fredericka Sigalingging	0%
1168	Viorencia Tantana	14%
1169	Gisellene Lowisuri	0%
1170	Kaylynn Zhanghoven	0%
1171	Angelina Cenata	0%
1172	Ferdian Zulkarnain	0%
1173	Mia Emily Soeripin	0%
1174	Vivienne Claire Soeripin	0%
1175	Vingeline Chelsealya Angkasa	0%
1176	Jean Catherine Anneliese Sebayang	0%
1177	James Edward Lie	0%
1178	Richeline Huang	0%
1179	Livi Celia Lim	0%
1180	Hariwell	0%
1181	Azzam Al Vanka	0%
1182	Stella Wijaya	0%
1183	Maxwell Utomo	0%
1184	Louis Sinclair Zuary	0%
1185	Genovia Grace Widjaja	0%
1186	Ray Yudhistira Ng	0%
1187	Michelle Aurelia Chen	0%
1188	James Oliver Coaca	0%
1189	Kennan Eito Shankara	0%
1190	Nalina Vimala	0%
1191	Joya Vania Silaen	0%
1192	Sergio Ronald Utomo	0%
1193	Cheryl Eilyn Affandy	0%
1194	Max Kingston Marzuki	0%
1195	Kenzo Wibowo Marzuki	0%
1196	Grace Martok	0%
1197	Adzkiya Kyona Mahendra	0%
1198	Jovan Jonathan Cen	0%
1199	Joey Jonas Cen	0%
1200	Jayden Darren Wijaya	0%
1201	Ivania Gracesinka	0%
1202	Cornelius Wilfred	0%
1203	Kevin Fico Aurelio	0%
1204	Kendrick Filbert Aurelio	0%
1205	Kaylee Alessia Ridgen	0%
1206	Daniel Haryanto	0%
1207	James Jayden Chandra	0%
1208	Dwayne Alvaro Phen	14%
1209	Michele Cecilia Belvania Saragih	0%
1210	Joycelyn Annabelle	0%
1211	Dion Lorenzo Castio	0%
1212	Aurelia Wyanto	0%
1213	Kaylee Wayne Laong	0%
1214	Fiona Tjongnata	0%
1215	Julfini Chu	0%
1216	Marc Maximus Zhang	0%
1217	Daxton Lie	0%
1218	Odilia Alexandra Yang	0%
1219	Naviauly Dolorosa Sinaga	0%
1220	Kinara Caliezia Pangestu	0%
1221	Cika Linatasia Tampubolon	0%
1222	Hans Andersen Yap	0%
1223	Steve Marcellino	0%
1224	Collins Anderson	0%
1225	Winnie Lorenz Tjialin	0%
1226	No registration	0%
1227	No registration	0%
1228	No registration	0%
1229	No registration	0%
1230	No registration	0%
1231	No registration	0%
1232	No registration	0%
1233	No registration	0%
1234	No registration	0%
1235	No registration	0%
1236	No registration	0%
1237	No registration	0%
1238	No registration	0%
1239	No registration	0%
1240	No registration	0%
1241	No registration	0%
1242	No registration	0%
1243	No registration	0%
1244	No registration	0%
1245	No registration	0%
1246	No registration	0%
1247	No registration	0%
1248	No registration	0%
1249	No registration	0%
1250	No registration	0%
1251	No registration	0%
1252	No registration	0%
1253	No registration	0%
1254	No registration	0%
1255	No registration	0%
1256	No registration	0%
1257	No registration	0%
1258	No registration	0%
1259	No registration	0%
1260	No registration	0%
1261	No registration	0%
1262	No registration	0%
1263	No registration	0%
1264	No registration	0%
1265	No registration	0%
1266	No registration	0%
1267	No registration	0%
1268	No registration	0%
1269	No registration	0%
1270	No registration	0%
1271	No registration	0%
1272	No registration	0%
1273	No registration	0%
1274	No registration	0%
1275	No registration	0%
1276	No registration	0%
1277	No registration	0%
1278	No registration	0%
1279	No registration	0%
1280	No registration	0%
1281	No registration	0%
1282	No registration	0%
1283	No registration	0%
1284	No registration	0%
1285	No registration	0%
1286	No registration	0%
1287	No registration	0%
1288	No registration	0%
1289	No registration	0%
1290	No registration	0%
1291	No registration	0%
1292	No registration	0%
1293	No registration	0%
1294	No registration	0%
1295	No registration	0%
1296	No registration	0%
1297	No registration	0%
1298	No registration	0%
1299	No registration	0%
1300	No registration	0%
70100001	Katrisha Davinia Lim	14%
70100002	Matthew Yeo	0%
70100003	Cherisse Wong Jono	0%
70100004	Maryam Shareen Anandifa	29%
70100005	Lyvia Verlynn	0%
70100006	Jason Hartono Huang	0%
70100007	Jevany	29%
70100008	Clarissa Ruthana Sipayung	43%
70100009	No registration	0%
70100010	Nicole Rikki	57%
70100011	No registration	0%
70100012	No registration	0%
70100013	No registration	0%
70100014	Desmond Dinata Ong	14%
70100015	Judyth Annabelle Naulibasa 	0%
70100016	Dwayne Jzekiel Angsana	29%
70100017	No registration	0%
70100018	No registration	0%
70100019	Andrea Tabitha Florencia Simatupang	0%
70100020	Diandra Ezra Nauli Simatupang	0%
70100021	Rafael Daniello Tamba	29%
70100022	Josandy	14%
70100023	Evonne Gwen Lim	71%
70100024	No registration	0%
70100025	No registration	0%
70100026	No registration	0%
70100027	Daniel Goh	0%
70100028	Elaine Gwen Lim	14%
70100029	No registration	0%
70100030	No registration	0%
70100031	Rahardian Ozil S	0%
70100032	No registration	0%
70100033	No registration	0%
70100034	Muazzam Khalifi Adera	14%
70100035	Fasya Putradinata Syam	0%
70100036	Gilbert Faustin Wijaya	14%
70100037	Abigail Rhea Lim	0%
70100038	Richard Alexi Pratama	0%
70100039	Gwen Valerie	71%
70100040	Mario Dominic Warouw	43%
70100041	Raisha Adila Gunawan	0%
70100042	Jessica Sharon	29%
70100043	Enrico Felix Daniel Siagian	57%
70100044	Amelia Natasha Siagian	14%
70100045	No registration	0%
70100046	Kirania Inara Azalea	14%
70100047	Keyzia Faiana Daulay	29%
70100048	Moreno De Truman	86%
70100049	Eillen Faustine Wijaya	0%
70100050	Ellys Faustine Wijaya	0%
70100051	Enzo Howell	0%
70100052	Darrel Hizkia Tambunan	0%
70100053	Ghassan Ghazali Ginting	29%
70100054	Olivia Nooman	43%
70100055	Clarissa Kimberly Luvalencia	0%
70100056	Jason Louis	0%
70100057	Evelyn Frelda Gurning	71%
70100058	Anya Pehulisa Ginting	0%
70100059	Rebecca Florencia Siregar	0%
70100060	Lincoln Blaine	0%
70100061	Colleen Blaine	43%
70100062	Nichole Hasan	0%
70100063	Calysta Celorine Bakara	14%
70100064	Rachel Nathania Situmorang	14%
70100065	No registration	0%
70100066	No registration	0%
70100067	No registration	0%
70100068	Radinka Agra Sitepu	0%
70100069	Al Namira Safitri Saragih	14%
70100070	Keysha Kania Ramaditya	29%
70100071	Muhammad Al Khawarizmi Fairel	29%
70100072	No registration	0%
70100073	Tristan Arsenio	0%
70100074	Darnell Samahea Lakhomi Laia	0%
70100075	Maro Louis Dear Purba	0%
70100076	Marwa Alya Sakinah Rangkuti	0%
70100077	Aldiana Masha Lovelia Br Sembiring	0%
70100078	Sakina Alima Regune Harahap	0%
70100079	Almira Izanti Kamilah Daulay	0%
70100080	Dewi Syaahira Sabina Siregar	0%
70100081	Carmen Tjokromitro	0%
70100082	Careen Tjokromitro	14%
70100083	Breanna Octovindo	0%
70100084	No registration	0%
70100085	No registration	0%
70100086	Maria Graciana Chica Purba	0%
70100087	Micella Alexa Pinem	0%
70100088	Mikhayla Tabita Pinem	0%
70100089	Aurelia Intan Leung	57%
70100090	Annisa Letizia Shanum	14%
70100091	No registration	0%
70100092	No registration	0%
70100093	No registration	0%
70100094	No registration	0%
70100095	No registration	0%
70100096	No registration	0%
70100097	No registration	0%
70100098	Erland Sohilida Laia	0%
70100099	No registration	0%
70100100	No registration	0%
70100101	No registration	0%
70100102	Bryan Taslim	29%
70100103	No registration	0%
70100104	No registration	0%
70100105	No registration	0%
70100106	Dareen Davinci Ginting	29%
70100107	No registration	0%
70100108	No registration	0%
70100109	Kania Ghassani Setiawan	0%
70100110	Filbert Wandrew	0%
70100111	Keshia Nakia Hayfa Azka	71%
70100112	Fathi Arkan Wiyatmika	29%
70100113	Jiselle Hartanto	29%
70100114	Frederika Lovenberg Siahaan	0%
70100115	Candice Alicia Wai	0%
70100116	Rayyan Putra Raharjo	0%
70100117	Akhdan Arief Athaya	0%
70100118	Cladys Nadine Frietania	0%
70100119	Chew Zi Yang	0%
70100120	Aishaqillah Syifatin Mahirah Kurniawan	29%
70100121	Shane Anthony Jawson	0%
70100122	Shadrina Azheema Lubis	0%
70100123	Shafiqa Adeeva Lubis	0%
70100124	Mikayla Aqueena Shaquilla	29%
70100125	Moni Laprincia Br Ginting	14%
70100126	Berliando Lovely Sihombing	0%
70100127	Gabriel Ihut Martuaro Sihombing	0%
70100128	Syia Kim	0%
70100129	Alliya Ellduci Dermawan	57%
70100130	Muhammad Rafa Al Siena	0%
70100131	Clairine Bellvania Gavrila Ginting	0%
70100132	Devin Suhendra 	57%
70100133	Lionel Maverick 	0%
70100134	Diandra Santika	0%
70100135	Adib Nufal Wibowo	0%
70100136	Syakirah Khairani Jamilah	86%
70100137	Frederika Lovenberg Siahaan	0%
70100138	Maura Shaqifa Rubyna	71%
70100139	Daniella Demeintieva	14%
70100140	Gabriella Theofanny Putri Meliala	0%
70100141	Aqeela Shafa Batrisya	57%
70100142	Shane Nathantaras Tarigan	57%
70100143	Kaleb Edgar Goel Hasugian	0%
70100144	Faqih Fadhilah Wijaya	14%
70100145	Hafiqa Raikhsa Karo Karo	57%
70100146	Alexa Brianna Tambunan	0%
70100147	Faza Kiyana Azdah	0%
70100148	Davina Elisha Ginting	0%
70100149	Jaeson Nathan Yap	0%
70100150	Nadhira Calista Purba	14%
70100151	Fakhira Idris Harahap	29%
70100152	Abigail Carissa 	0%
70100153	Dareen Azel Matthew Sembiring	100%
70100154	Ashera Natama Sitorus	0%
70100155	Stella Aprilia Sianipar 	0%
70100156	Tengku Muhammad Malik Al Fatih	100%
70100157	Faqhan Asshadiq Winata	0%
70100158	Gracelyn Patricia	0%
70100159	Nadia Fathaniah Chandra	14%
70100160	Jordan Noel Yap	14%
70100161	Khezya Queen Zareen Br Panggabean 	0%
70100162	Arya Satya	0%
70100163	No registration	0%
70100164	No registration	0%
70100165	Ghazia Raesha Afthani Lubis	0%
70100166	Farrin Rafania Shezan Lubis	43%
70100167	Arsa Clianta Saragih	29%
70100168	Mora Leticia Sinaga	29%
70100169	Warren Leander Wichael	0%
70100170	No registration	0%
70100171	No registration	0%
70100172	No registration	0%
70100173	Muhammad Naufal Athariz Ritonga	0%
70100174	Jerrick Onggoro Hakim	43%
70100175	Ondo Vico Fidelis Giant Sitohang 	14%
70100176	Muhammad Asyam Haris Tanjung 	0%
70100177	Raphael Evan Hiro Ompusunggu	0%
70100178	No registration	0%
70100179	Doria Marchisia Giussevine Saragih	0%
70100180	Jevano Septarey Saragih	0%
70100181	No registration	0%
70100182	No registration	0%
70100183	No registration	0%
70100184	Atha Malik Chairmawan	0%
70100185	Alice Nathalie Brigitta	14%
70100186	Alvaro Gavriel Batara Sihotang	0%
70100187	Graccyella Martgehaan	0%
70100188	Latisya Naya Alamsyah Nasution	0%
70100189	Lashira Naifa Alamsyah Nasution	0%
70100190	Arta Glory Hutasoit	0%
70100191	Yosihana Hutasoit	14%
70100192	Kania Laviza Andhini	0%
70100193	Nadhira Ayria Verdian	0%
70100194	Danella Christabel Hasean Saragih	0%
70100195	Marisca Agustina Br Surbakti	0%
70100196	Abdullah Syafa Assyunni Rangkuti	0%
70100197	Keira Agatha Dameria Resubun	0%
70100198	No registration	0%
70100199	No registration	0%
70100200	No registration	0%
70100201	No registration	0%
70100202	No registration	0%
70100203	No registration	0%
70100204	No registration	0%
70100205	No registration	0%
70100206	No registration	0%
70100207	No registration	0%
70100208	No registration	0%
70100209	No registration	0%
70100210	No registration	0%
70100211	No registration	0%
70100212	No registration	0%
70100213	No registration	0%
70100214	No registration	0%
70100215	No registration	0%
70100216	No registration	0%
70100217	No registration	0%
70100218	No registration	0%
70100219	No registration	0%
70100220	No registration	0%
70100221	No registration	0%
70100222	No registration	0%
70100223	No registration	0%
70100224	No registration	0%
70100225	No registration	0%
70100226	No registration	0%
70100227	No registration	0%
70100228	No registration	0%
70100229	No registration	0%
70100230	No registration	0%
70100231	No registration	0%
70100232	No registration	0%
70100233	No registration	0%
70100234	No registration	0%
70100235	No registration	0%
70100236	No registration	0%
70100237	No registration	0%
70100238	No registration	0%
70100239	No registration	0%
70100240	No registration	0%
70100241	No registration	0%
70100242	No registration	0%
70100243	No registration	0%
70100244	No registration	0%
70100245	No registration	0%
70100246	No registration	0%
70100247	No registration	0%
70100248	No registration	0%
70100249	No registration	0%
70100250	No registration	0%
	No registration	#N/A
90100001	Rowan Maverick Ang	0%
90100002	Giselle Liandy	0%
90100003	Ivy Jeane Chanella	0%
90100004	Jeovenna Cangie	0%
90100005	Felynn Holy Richson	14%
90100006	Kenzie Rowland Huangdinata	43%
90100007	Carrick Classico	0%
90100008	Michelle Teochan	14%
90100009	Marchelline Teochan	14%
90100010	Chloe Marjorie Wen	86%
90100011	Chloe Quisha Anggara	29%
90100012	Emily Santo	0%
90100013	Candice Julian Sakiwa	43%
90100014	Claire Adelynn Wu	43%
90100015	Clarissa Felicia Chandra	0%
90100016	Rodrigo Lorenzo	14%
90100017	Clarabelle Louisa	0%
90100018	No registration	0%
90100019	No registration	0%
90100020	Winston Hubert	0%
90100021	Aidan Benjamin Yapar	0%
90100022	Jeanice Wu	43%
90100023	Brooklyn Svenrich Ang	57%
90100024	Welceline Charissa Tsjin	29%
90100025	Celine Devina Guo	29%
90100026	Winston Guo	0%
90100027	No registration	0%
90100028	Haylee Weng	0%
90100029	No registration	0%
90100030	No registration	0%
90100031	Marvel Chan Rachmat	0%
90100032	Rohan Chan Rachmat	0%
90100033	Matthew Dunston Halim 	0%
90100034	Quinsha Charlyn Ow	14%
90100035	Carlen Edeline Br. Keliat	14%
90100036	Carlos Ferdinand Putra	29%
90100037	No registration	0%
90100038	No registration	0%
90100039	Reynard Alderich Guntur	0%
90100040	No registration	0%
90100041	Philips	0%
90100042	Justin Nawi	0%
90100043	Valentino Owen Liu	0%
90100044	Velove Alexa Winstan	100%
90100045	David Howard	14%
90100046	Hugo Maximus Ling	0%
90100047	Bryant Maximus Ling	14%
90100048	No registration	0%
90100049	Harvey Susanto	29%
90100050	No registration	0%
90100051	Valerie Legolas Cen	0%
90100052	No registration	0%
90100053	No registration	0%
90100054	No registration	0%
90100055	Felicia Tham	
90100056	Thalissha Yeonan	
90100057	Edward Lie	
90100058	Najla Putri Yosifa	
90100059	Jared Nawi	
90100060	Alfred Smaver Tanasal	
90100061	Elaine Gabriella Chandella	
90100062	Cherish Graciella Chandella	
90100063	Fraderic Milerlim	
90100064	Olson Arfayo	
90100065	Richia Dominic Liawfanny	
90100066	Celine Oubre	
90100067	Victor Alexander Winstan	
90100068	Ixchel Lowell Tankiono	
90100069	Erynn Maxine Lau	
90100070	Jack Austin Sia	
90100071	Kevin Declan Kusumo	
90100072	Kenji Ryo Kusumo	
90100073	No registration	
90100074	Faulina Theresia Pangaribuan	
90100075	Kingsley Alisson Tenang	
90100076	Carolline Jackqueen Cen	
90100077	Olivia Lincoln	
90100078	No registration	
90100079	Gracella Cangie	
90100080	Vanessa Cangie	
90100081	Hayden Fredderick Halim	
90100082	Tang En Xin	
90100083	Filbert Laithen	
90100084	Warren Nicholas Khu	
90100085	Frederico Sanrio Sanjaya	
90100086	Eric Williarn	
90100087	Finn Maxwell	
90100088	Khairiy Raka Azizi Hermansyah	
90100089	Alvyn Zhu	
90100090	Alfarizy Raqila Hermansyah	
90100091	Heidi Tanamin	
90100092	Adlyansah Rizki Tiloli	
90100093	Jesslyn Lee	
90100094	Feliks Ananda Lee	
90100095	No registration	
90100096	No registration	
90100097	Annabel Audriana	
90100098	Meghan Hailey Hidayat	
90100099	Rowan Tirta Lee	
90100100	Jasmine Zhang	
90100101	Jayden Zhang	
90100102	Chloe Marche Khu	
90100103	Claire Eugenia Khu	
90100104	Hannah Sophia Salim	
90100105	Angelica Makro	
90100106	M Rasya Dalimunthe	
90100107	Stoffel Swandeez Angkasa	
90100108	Vergio Gavino Chaikoff	
90100109	Jolin Thianda	
90100110	Cedric Max Osmond	
90100111	Victoria Chandra	
90100112	Richie Alvaro Tandinata	
90100113	Reynard Shendior	
90100114	Kate Elizabeth Huang	
90100115	William Lauda	
90100116	Janessa Hofang	
90100117	Jarell Hofang	
90100118	Jesslyn Hofang	
90100119	No registration	
90100120	Jocelyn Sydney 	
90100121	Aileen Alfina Susanto	
90100122	Tiffany Toh	
90100123	Trevor Toh	
90100124	Michael James Tantao	
90100125	Matthew James Tantao	
90100126	Cherryl Angelia Sandy	
90100127	Davin Bradford	
90100128	Dustin Bradley	
90100129	Jasmine Ryana Ngadimin	
90100130	Maurice Claire Genevieve	
90100131	Gillian Natalie Wilfred	
90100132	Louis Adrian	
90100133	Josh Andrew	
90100134	Rodrick Stefano Halim	
90100135	Rainie Lynn	
90100136	Miho Qanitah Sihombing	
90100137	Keiko Hanara Sihombing	
90100138	Vyon Wynter Huang	
90100139	Mikayla Seline Wu	
90100140	Jadellyne Gretchenagatha Zhuotio	
90100141	Carrie Priscilla Figo	
90100142	Priscilla Vidarlin	
90100143	Jason Lewis Theo	
90100144	Vincenzo	
90100145	Viona Bellavania Birgitta	
90100146	Selena Frederica Castalia	
90100147	Griffin Theodoric	
90100148	Kei Evander Buhari 	
90100149	Stevanie Angel Gunawan	
90100150	Graciella Wiselie	
90100151	Warren Tandias	
90100152	Shirleen Nyrtle	
90100153	Ethan Putra Gotama	
90100154	Emmeline Aurelia Lie	
90100155	Nathan Archie Gunawan	
90100156	Nicole Anastasia	
90100157	Jean Kelly Samudra Tjuaja	
90100158	Gwen vidyatan	
90100159	No registration	
90100160	Klarissa Evania Buhari 	
90100161	Harvey Taufik	
90100162	Adrian Soh	
90100163	Videline Gillian Chaikoff	
90100164	Jarred Eldridge Tantama	
90100165	Muhammad Alby Azka Lubis	
90100166	Reinz Stythan 	
90100167	Alicia Quinn chandranata	
90100168	Madelyn Henryetta Fang	
90100169	Eleora Iskandar Liunardi	
90100170	Viyona Gavriela Muis	
90100171	Eileen Yui Chen	
90100172	Michi Amira Sukmana	
90100173	Jeneiro	
90100174	Otto Valerino Lim	
90100175	Jovan Leonard Lui	
90100176	Rahma Nakita Afifah	
90100177	Dominica Cherish Sheiramoth	
90100178	MIRACLE HUANG	
90100179	Emily moraine hakim	
90100180	Jayden jiefferson	
90100181	Madeleine Cendana	
90100182	MAXWELL TENAR	
90100183	Heinz victorio zhou	
90100184	No registration	
90100185	Natasha Clairine Wu	
90100186	Samantha Clairine Wu	
90100187	No registration	
90100188	Rebecca kelly ashari	
90100189	Abigail avery ashari	
90100190	Daphne Nathania Ang	
90100191	Bosco Lim	
90100192	Jayden Jingga	
90100193	Tyra Louise Tohnika	
90100194	Tyler Howard Tohnika	
90100195	Sarah Oktorela Sitorus	
90100196	Jordan Philip Wihono	
90100197	Jeffrey Yap	
90100198	Jordan Swiss Cliftan 	
90100199	Steve Mason	
90100200	Galent hansen wuner	
90100201	Crystaline Angela indrajaya	
90100202	Xavierra Kaylyn Leeon	
90100203	Clarice Valenzka Wijaya	
90100204	Chloe Wong	
90100205	Bernice Wong	
90100206	Metta Louise ellen	
90100207	Darynne Clarabelle Yuan	
90100208	Patricia	
90100209	George 	
90100210	Wilbenzs Howard	
90100211	Callista Aurelia alven 	
90100212	Quinn Rachel Liu 	
90100213	Seabert Swandeez Angkasa	
90100214	Louis kendrick	
90100215	Phebe Lalita	
90100216	Jollyne Gretchenavery Zhuotio	
90100217	CHARLIE MIKKELSEN YAP	
90100218	Phebe Diorra Salim	
90100219	Destine Diorra Salim	
90100220	No registration	
90100221	Ryan Aurelio Bustamin	
90100222	No registration	
90100223	Feodora Meidy Leandra	
90100224	Hillary Quinn	
90100225	Richelle lim	
90100226	GEORGE FENDISON	
90100227	Richard Edbert Susantio 	
90100228	Hanson julio tanadi	
90100229	HEUGER LAY	
90100230	KYGO LAY 	
90100231	Queenza Theodora Wijaya	
90100232	Kathrine Chrestella	
90100233	Sam Lincoln Kane	
90100234	Lionel evander jayadi	
90100235	Hermione Emmilia Artjim	
90100236	WINSTON XAVERIUS JUNIO	
90100237	Callista Aurora Welopo	
90100238	Sean Alexio xanderv	
90100239	JOYXE ADELINE WISELY	
90100240	Alpine Miler Luo	
90100241	Jeremy Arthur Anggriawan	
90100242	Beverly Mandy Tjoeng	
90100243	Ryuichi loury 	
90100244	Rozelle Xiera	
90100245	Mason Ivander Cahaya	
90100246	Felice limandar	
90100247	Garcia limandar	
90100248	Richie Wong Yon Chuang	
90100249	Ahmad Hanif	
90100250	Aldrich Smaver Tanasal	
90100251	Felix Austin Lumbantobing	
90100252	Alleluia Elyona Sitohang	
90100253	Ruby Faustin Amat	
90100254	Reagan Alberic Guntur 	
90100255	Felicia Fransisca	`;

async function updateReportActivitySchemaAndData() {
  try {
    console.log('Updating schema for report_activity...');
    
    // Drop level_up_checklist if exists and add level_up_sp, level_up_lp, life_project_to_next_level, last_speaking_project
    await db.query(`
      ALTER TABLE report_activity 
      DROP COLUMN IF EXISTS level_up_checklist;
      
      ALTER TABLE report_activity 
      ADD COLUMN IF NOT EXISTS level_up_sp VARCHAR(100),
      ADD COLUMN IF NOT EXISTS level_up_lp VARCHAR(100),
      ADD COLUMN IF NOT EXISTS life_project_to_next_level VARCHAR(50),
      ADD COLUMN IF NOT EXISTS last_speaking_project VARCHAR(100);
    `);
    console.log('Schema updated successfully.');

    console.log('Parsing Life Project to Next Level data...');
    const lines = rawLifeProjectData.split(/\r?\n/).filter(l => l.trim());
    const lpPairs = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split('\t').map(c => c.trim());
      const id = cols[0];
      const name = cols[1];
      const lp = cols[2];

      if (!id || !name || name.toLowerCase() === 'no registration') continue;

      lpPairs.push({ id, lp: (lp && lp !== '#N/A') ? lp : null });
    }

    console.log(`Parsed ${lpPairs.length} valid Life Project values. Executing bulk update...`);

    // Bulk update life_project_to_next_level using temp table
    await db.query(`DROP TABLE IF EXISTS temp_lp_map; CREATE TEMP TABLE temp_lp_map (id_val VARCHAR(100), lp_val VARCHAR(50));`);

    const chunkSize = 200;
    for (let i = 0; i < lpPairs.length; i += chunkSize) {
      const chunk = lpPairs.slice(i, i + chunkSize);
      const valStrings = [];
      const params = [];

      chunk.forEach(p => {
        params.push(p.id, p.lp);
        valStrings.push(`($${params.length - 1}, $${params.length})`);
      });

      await db.query(`INSERT INTO temp_lp_map (id_val, lp_val) VALUES ${valStrings.join(', ')}`, params);
    }

    const updateRes = await db.query(`
      UPDATE report_activity r
      SET life_project_to_next_level = t.lp_val,
          updated_at = NOW()
      FROM temp_lp_map t
      WHERE r.trainee_id = t.id_val;
    `);

    console.log(`Successfully updated ${updateRes.rowCount} rows with life_project_to_next_level!`);

    const sample = await db.query(`SELECT trainee_id, name, speaking_project_to_next_level, life_project_to_next_level, last_speaking_project, level_up_sp, level_up_lp FROM report_activity WHERE life_project_to_next_level IS NOT NULL AND life_project_to_next_level != '0%' LIMIT 5;`);
    console.log('Sample updated rows:', sample.rows);

  } catch (err) {
    console.error('Error updating report_activity schema/data:', err);
  } finally {
    process.exit(0);
  }
}

updateReportActivitySchemaAndData();

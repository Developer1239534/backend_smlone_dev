const fs = require('fs');
const db = require('./src/db/neonClient');

const tsvData = `70100019	Andrea Tabitha Florencia Simatupang	Expired
70100020	Diandra Ezra Nauli Simatupang	Expired
70100003	Cherisse Wong Jono	Expired
70100001	Katrisha Davinia Lim	Expired
70100004	Maryam Shareen Anandifa	Active
70100005	Lyvia Verlynn	Active
70100008	Clarissa Ruthana Sipayung	Expired
70100007	Jevany	Expired
70100022	Josandy	Expired
70100023	Evonne Gwen Lim	Active
70100021	Rafael Daniello Tamba	Expired
70100010	Nicole Rikki	Expired
70100013	Aldin Roi Angkasa	
70100014	Desmond Dinata Ong	Expired
70100016	Dwayne Jzekiel Angsana	Expired
70100028	Elaine Gwen Lim	Active
70100031	Rahardian Ozil S	Expired
70100034	Muazzam Khalifi Adera	Expired
70100035	Fasya Putradinata Syam	Expired
70100036	Gilbert Faustin Wijaya	Expired
70100037	Abigail Rhea Lim	Active (Grace Period)
70100038	Richard Alexi Pratama	Expired
70100039	Gwen Valerie	Expired
70100040	Mario Dominic Warouw	Expired
70100041	Raisha Adila Gunawan	Active (Grace Period)
70100042	Jessica Sharon	Active
70100043	Enrico Felix Daniel Siagian	Expired
70100044	Amelia Natasha Siagian	Expired
70100045	Hansen Cornelius Goklas Siagian	
70100046	Kirania Inara Azalea	Active
70100047	Keyzia Faiana Daulay	Active
70100048	Moreno De Truman	Expired
70100049	Eillen Faustine Wijaya	Expired
70100050	Ellys Faustine Wijaya	Expired
70100051	Enzo Howell	Expired
70100002	Matthew Yeo	Expired
70100052	Darrel Hizkia Tambunan	Active (Grace Period)
70100053	Ghassan Ghazali Ginting	Expired
70100054	Olivia Nooman	Expired
70100055	Clarissa Kimberly Luvalencia	Expired
70100056	Jason Louis	Expired
70100057	Evelyn Frelda Gurning	Expired
70100058	Anya Pehulisa Ginting	Expired
70100059	Rebecca Florencia Siregar	Active
70100060	Lincoln Blaine	Active
70100061	Colleen Blaine	Active
70100062	Nichole Hasan	Active
70100063	Calysta Celorine Bakara	Active
70100064	Rachel Nathania Situmorang	Active (Grace Period)
70100027	Daniel Goh	Active
70100067	Sophia Rachel	
70100069	Al namira safitri saragih	Expired
70100068	Radinka agra sitepu	Active
70100071	Muhammad Al Khawarizmi Fairel	Active
70100073	Tristan Arsenio	Expired
70100074	Darnell Samahea Lakhomi Laia	Expired
70100070	Keysha Kania Ramaditya	Active
70100071	Muhammad Al Khawarizmi Fairel	Active
70100073	Tristan Arsenio	Expired
70100074	Darnell Samahea Lakhomi Laia	Expired
70100075	Maro Louis Dear Purba	Expired
70100076	Marwa Alya Sakinah Rangkuti	Active
70100077	Aldiana Masha Lovelia Br Sembiring	Expired
70100078	Sakina Alima Regune Harahap	Active
70100079	Almira Izanti Kamilah Daulay	Expired
70100080	Dewi Syaahira Sabina Siregar	Active
70100081	Carmen Tjokromitro	Expired
70100082	Careen Tjokromitro	Expired
70100083	Breanna Octovindo	Expired
70100086	Maria Graciana Chica Purba	Active
70100087	Micella Alexa Pinem	Expired
70100088	Mikhayla Tabita Pinem	Expired
70100089	Aurelia Intan Leung	Expired
70100090	Annisa Letizia Shanum	Active
70100102	Bryan Taslim	Active
70100106	Dareen Davinci Ginting	Active
70100110	Filbert Wandrew	Expired
70100111	Keshia Nakia Hayfa Azka	Expired
70100112	Fathi Arkan Wiyatmika	Active
70100113	Jiselle Hartanto	Active
70100115	Candice Alicia Wai	Expired
70100098	Erland Sohilida Laia	Active (Grace Period)
70100116	Rayyan Putra Raharjo	Expired
70100117	AKHDAN ARIEF ATHAYA	Active
70100118	CLADYS NADINE FRIETANIA	Active
70100119	Chew Zi Yang	Expired
70100120	Aishaqillah Syifatin Mahirah Kurniawan	Expired
70100121	Shane Anthony Jawson	Active
70100122	Shadrina Azheema Lubis	Active
70100123	Shafiqa Adeeva Lubis	Active
70100124	Mikayla Aqueena Shaquilla	Expired
70100125	MONI LAPRINCIA BR GINTING	Expired
70100126	Berliando lovely sihombing	Active
70100127	Gabriel Ihut Martuaro Sihombing	Active
70100128	SYIA	Active
70100129	Alliya Ellduci Dermawan	Expired
70100130	Muhammad Rafa Al Siena	Active
70100131	Clairine Bellvania Gavrila Ginting	Active
70100132	Devin Suhendra	Expired
70100133	Lionel Maverick	Active
70100134	Diandra Santika	Active
70100135	Adib Nufal Wibowo	Active
70100136	Syakirah Khairani Jamilah	Active
70100138	Maura Shaqifa Rubyna	Expired
70100139	Daniella Demeintieva	Active
70100140	Gabriella Theofanny Putri Meliala	Active
70100141	Aqeela Shafa Batrisya	Expired
70100142	Shane Nathantaras Tarigan	Expired
70100143	Kaleb Edgar Goel Hasugian	Active
70100144	Faqih Fadhilah Wijaya	Active
70100145	Hafiqa Raikhsa Karo Karo	Active (Grace Period)
70100146	Alexa Brianna Tambunan	Active
70100147	Faza Kiyana Azdah	Active
70100148	Davina Elisha Ginting	Expired
70100149	Jaeson Nathan Yap	Active
70100150	Nadhira Calista Purba	Active
70100151	Fakhira Idris Harahap	Active (Grace Period)
70100152	Abigail Carissa	Expired
70100153	Dareen Azel Matthew Sembiring	Active
70100154	Ashera Natama Sitorus	Active
70100155	Stella Aprilia Sianipar	Active
70100156	Tengku Muhammad Malik Al Fatih	Active (Grace Period)
70100157	Faqhan Asshadiq Winata	Active
70100158	Gracelyn Patricia	Active
70100159	Nadia Fathaniah Chandra	Active
70100160	Jordan Noel Yap	Active
70100161	Khezya Queen Zareen Br Panggabean	Active
70100162	Arya Satya	Active
70100165	Ghazia Raesha Afthani Lubis	Active
70100166	Farrin Rafania Shezan Lubis	Active
70100173	Muhammad Naufal Athariz Ritonga	Active
70100174	Jerrick Onggoro Hakim	Active
70100176	Muhammad Asyam Haris Tanjung	Active
70100179	Doria Marchisia Giussevine Saragih	Active
70100180	Jevano Septarey Saragih	Active
70100184	Atha Malik Chairmawan	Active
70100185	Alice Nathalie Brigitta	Active
70100186	Alvaro Gavriel Batara Sihotang	Active
70100187	Graccyella Martgehaan	Active
70100188	Latisya Naya Alamsyah Nasution	Active
70100189	Lashira Naifa Alamsyah Nasution	Active
70100190	Arta Glory Hutasoit	Active
70100191	Yosihana Hutasoit	Active
70100167	Arsa Clianta Saragih	Active
70100168	Mora Leticia Sinaga	Active
70100175	Ondo Vico Fidelis Giant Sitohang	Active
70100177	Raphael Evan Hiro Ompusunggu	Active
70100192	Kania Laviza Andhini	Active
70100193	Nadhira Ayria Verdian	Active
70100169	Warren Leander Wichael	Active
70100194	Danella Christabel Hasean Saragih	Active
70100195	Marisca Agustina Br Surbakti	Active
70100196	Abdullah Syafa Assyunni Rangkuti	Active
70100197	Keira Agatha Dameria Resubun	Active
602	Alexandra Joan Micheline	Active
601	Mikaella Hutteleigh Ng	Active
636	Zia Arafa Khairina	Active
671	Chloe Bernice Tan	Expired
614	Rayden Chiang	Active
610	Josh Frederric Ang	Expired
618	Yamin Yenardo	Expired
613	Junior Auson Halim	Active
599	Nadya Aretha Ui	Expired
645	Marsha Ava Kaylana	Expired
654	Rayden Oh	Expired
672	Arissa Wijaya	Expired
674	Lorabelle Leon	Expired
675	Maxen Zo Leon	Active
676	Grace Alexandra	Active
680	Gracelyn Yap	Active
681	Vanessa Sonata	Expired
669	Veraldo Valentino Rusli	Expired
683	Stanley Ace Lorence	Active
686	Owen Linwood	Active
697	Ruby Lie	Expired
318	Ellena Jocelyn Lasiman	Expired
368	Felice Vallerie Angkasa	Active
640	Amelia Laurence	Expired
642	Feligio Beatryan Wijaya	Expired
605	Philbert Charlin	Expired
517	Jack Travis Lee	Expired
329	Vrederick Benaricco Tanjaya	Active (Grace Period)
484	Arcelio Winston Laurence 	Expired
141	Russell William Tanner	Active
647	Celine Hadian	Expired
519	Valencia Wibowo	Expired
518	Joe Jasper Lee	Expired
607	Gilbert Charlin	Expired
619	Gilbert	Expired
478	Gracelyn Lawrence 	Expired
288	Carisle Vee Lovel	Expired
339	Ellen Angelica	Expired
482	Reizo Kazuo Wong	Active (Grace Period)
493	Davian Anders	Expired
446	Victoria Juhana	Expired
588	Vallerent Viquel	Expired
588	Vallerent Viquel	Expired
563	Fellicia Lawrence	Expired
486	Nakin Ben Cuseline	Expired
292	Dylan Raynald Sen	Expired
592	Marcelys Salim	Expired
583	Yuvrelyn Edren Yie	Expired
664	Chloe Valerie	Expired
575	Mandy Ellen Sanusi	Active
591	Joyce Mirabel Ng	Expired
690	Raynard Ang	Expired
689	Russell Ang	Expired
136	Claudine Joshanley	Active
606	Stella Fredella Teoh	Expired
635	Hillary Kayra Orsontio	Expired
638	Chloe Olivia Ruslie	Active
637	Celine Cheng	Expired
687	Philipp Torrien Chandra	Expired
707	Samho Gunawan	Active
547	Winson Natio	Expired
475	Jacinda Viorenza Valentina	Expired
595	Kathryn Jeslyn	Expired
545	Brandon Chiang	Active
556	Lewis Darren Huang	Expired
477	Jovetta Kiyomi Limilo	Expired
294	Katherine Argerikh Winata	Expired
521	Taryn Tjan	Expired
440	Sofia Grace Wu	Active
549	Clairine Joshanley 	Expired
582	Ethan Aldrich Lie	Active (Grace Period)
410	Dyra Muntazsirah	Active
269	Fresia Victoria Chendry	Active
429	Charrelle Anthony	Expired
646	Felivia Riandy	Expired
133	Oedia Ruth Vania	Expired
268	Freya Anastasia Chendry	Expired
661	Alexa Ellane	Expired
68	Othniel Rolando Manson	Expired
701	Louisya	Expired
632	Clarisa Valencia Khomala	Expired
652	Michelle Budiman	Expired
596	Nevaeh Ferry	Expired
476	Justin Rich Limilo	Expired
679	Fiorenza Eleanor Wijaya	Active (Grace Period)
623	Angelina Setyawan	Expired
624	Michael Setyawan	Expired
543	Stacey Carina Lim	Expired
608	Ava Katarina Tjhe	Expired
589	Aisyah Farah Setia Ixora	Expired
665	Khoo Shu Han	Expired
597	Stuart Hayden Tay	Expired
603	Max Viandi	Expired
621	Ufaira Tiandra Dalimunthe	Active
598	Mario Aretha Ui	Expired
612	Madelyn Chloe Wong	Expired
609	Rebecca Xie	Expired
433	James Oliver Neoman	Expired
630	Nichole Gabrielle Santoso	Expired
400	Richard Axel Tjhe	Expired
650	Quintus Aurelio Tjhe	Expired
627	Vin Maxwell	Expired
666	Khoo Kwang Wei 	Expired
633	Fiona Jolys Chong	Active (Grace Period)
644	Marson Nobleyu	Expired
670	Christian Anderson Lee	Expired
631	Queency Joycelyn Yieginia	Active
528	Kiery Keionna Kie	Active
587	Enrico Victorian	Active
569	Jo. Carel	Active
590	Zadden Tanaya	Expired
303	Lucas Zhang	Expired
653	Jermaine Eldwen	Expired
498	Jordan Alexander Lim	Expired
267	Darren Gabriel Wijaya	Expired
503	Wayne Lincoln Tansley	Expired
125	Jayxen Maxwell	Active
659	Kimberlyn Alexis Holiverz	Expired
504	Wyatt  Benjamin Tansley	Expired
560	Ruiz Stythan	Expired
291	Darrell Richard Sen	Expired
600	Gyan Lucero Joenardi	Active
617	Channelle Kimberley Wong	Expired
692	Alyssa Anne Wunanda	Expired
537	Sunshine Angelia Kwan	Expired
536	Sky Alexander Kwan	Expired
535	Harbert Ivander	Expired
494	Arsene Eldwen	Expired
539	Giselle NG	Expired
472	Stuart Tjuatja	Expired
48	Justin Maxwell	Active
151	Kenshiro Leowardy	Expired
128	Felice Naomi Tjiaren	Expired
130	Anastasya Sofie Yohan	Expired
20	Nicholas Matthew Halim	Expired
531	Max Chen	Active (Grace Period)
304	Louis Zhang	Expired
45	Aaron Goldwin Semarak	Expired
46	Marco Freddie Tjiaren	Expired
307	Josh Derrick Phen 	Expired
507	Abelvinco	Expired
250	Ryan Eagan Cendana	Expired
423	Felysse Auryn Khobert	Expired
64	Jillian Rusly 	Expired
63	Cleona Vivienne Lim	Expired
44	Stella Edlyn Kwok	Expired
488	Khansa Tabita Sakhi 	Expired
579	Wilbert Tanaya	Expired
309	Luiz Alvaro Diego	Expired
584	Ivann Raphael Ohary	Expired
441	Kenzie Fernando  Hugh	Expired
506	Clarabella	Expired
622	Zahra Ghaniyah	Expired
60	Sharleen Velicia Lim	Active
616	Sean Bryant Wong	Expired
333	Jasmine Yenarti	Active
295	Liv Agatha Jolie	Expired
658	Hugh Rhys Cendana	Expired
615	Louis Anthony Shen	Expired
688	Evelynn Belle Wunanda	Expired
691	Vanessa Claire Wunanda	Expired
483	Jolie Charlotte Huang	Active
443	Candyce Valezka  Moiras 	Active (Grace Period)
571	Aurelle Sophie Kesuma	Expired
50	Kenichi Zhou	Active
663	Jacqueline Simpson	Expired
553	Florencia Hewi	Active
274	Candice Winardi Wong	Active
530	Lewellyn Lois Chen	Expired
585	Harvey Wijaya	Active
586	Annabella Wijaya	Active
152	Welton Padmoasmolo	Expired
272	Jocelyn Basirun	Expired
82	Nicole Mila Khoman	Expired
445	Sherlyn Mireil	Expired
418	Aristo Wiley	Expired
685	Cherlyn Yaviera Chu	Expired
684	Chayden Yavier Chu	Expired
566	Jollyn Felicia Wong	Active
442	Beatrys  Vanesa Moiras 	Active (Grace Period)
534	Izzatun Nada Azzakiyah	Expired
548	Fiona  Candiof	Active
577	Jovanna Wong	Expired
682	Jocelyn Ryu Kaylee	Expired
532	Yasmin Fadhila Azzakiyah	Active
66	Ivaldo Juanda	Expired
31	Hans Sozo Wu	Expired
581	Nicholas Zheng	Active (Grace Period)
55	Justin Rusly	Expired
379	Cathelyn Basirun 	Expired
576	Joanne Wong	Expired
593	Houdrick Angelico	Expired
580	Vivienne Zheng	Active (Grace Period)
594	Harleen Angelic	Expired
301	Chloe Zhou	Active
396	Matthew Candiof	Expired
30	Chris Yochanan Wu	Expired
573	Alvaro Richie Theus	Expired
330	Avril Valerie Tjhe	Expired
568	Carlista	Expired
43	Petra Zoe Khoman	Expired
54	Grisvian Tandy	Expired
65	Gelsey Megan Chaniya	Expired
67	Claryce Annabelle  Yu 	Expired
51	Cedric Damon Yago	Active
49	Richmond Osyan Sudilan	Active
96	Hudson Fulviano Sentosa	Expired
137	Jovian Livio	Expired
320	Andrene Metta Leo	Expired
342	Louiselynn Nurimba	Expired
94	Flint Oliver	Expired
574	Brandon Tiojaya	Active
551	Ryuichiro Leowardy	Expired
604	Hugo Viandi	Active (Grace Period)
255	Denzel  Geraldo Wijaya	Active
490	Shane Ferrucio Lim	Active
578	Marvel William	Expired
620	Sierra Conrad	Expired
549	Clairine Kimberly	Expired
625	Audrey Hartono Lee	Active
628	Heidi Mikaela Tenggara	Expired
629	Joey Frederica Ang	Active
634	Glory Esther Simanjuntak	Expired
641	Emily Audrie Pannata	Expired
639	Bianca Olivia Ruslie	Active
651	Ashley Claire Lorence	Active
677	Olivia Florence Loesin	Active
678	Zoey Fiona Loesin	Expired
643	Bilson Nobleyu	Expired
673	Nathan Immanuel Winanto	Active
668	Richelle Shiven	Expired
667	Khoo Kwang Chen	Expired
655	Euan Benson Pranoto	Expired
662	Clayton Komar Kok	Expired
649	Geraldine Caitriona Saimen	Expired
698	Jason Maverick Tan	Expired
699	Audrey Pheng	Expired
700	Galen Lawden	Expired
701	Louisya Nistriora Manalu	Expired
702	Rayzellvion Edren Yie	Expired
703	Stacy Kho	Expired
704	Morgan Valentino Lowis	Active
705	Grace vania susanto	Expired
706	William Arthur Tjuatja	Expired
708	Dixen Andersen	Expired
709	Winston Lawrence	Active
710	Ethan Jae Ongko	Expired
711	Leon Walter Zhu	Expired
712	Ilona Freya Zhu	Expired
713	Ferguson Gohardjo	Expired
714	Delphine Adeline Bellinda	Expired
715	Ken Os Lim	Expired
716	Chloe Vallerie Jie	Active
717	Dmitri Meddef Njo	Expired
278	Clara Glory Xie	#N/A
719	Davar Aly Harahap	Active
720	James Richley Qiu	Expired
721	Jarred Qiu	Expired
722	Enzo Witton	Expired
723	Jolin Rochelle Chen	Expired
626	Alawi Ali Zumaini	Expired
726	RENZO TANAKA 	Expired
727	Edeline Wisely	Expired
728	VENAGNEISA VAN GRINSVEN	Expired
729	Carissa Aurelia Wylie	Expired
730	Felice Edly Liauwin	Expired
731	Nicole Alicia Tan	Expired
732	EDWARD LIU	Expired
733	Anindya Iftitah Lubis	Expired
734	Jillian Alessandra Tjhe	Expired
735	Kenward Melvern Djohan	Active
736	Kendrick Melvern Djohan	Active
737	Zivanna Quenby Boey	Expired
738	Adeline Njo	Active
740	AUBREE LISMAN	Active
739	Zoefiker Putera Ngadiman	Active
741	BRAYDEN LISMAN	Active
740	AUBREE LISMAN	Active
742	Zavelyn Marpauli	Expired
743	Nathanael Shawn Alexander	Expired
744	Vianne Renata Lim	Expired
745	Jesslyn	Active
746	Jocelyn leman	Expired
747	Jacklyn feliska hasan	Expired
749	Jocelyn M Yasmine Parhusip	Expired
753	Eugene Matthew	Expired
754	Reagan Khei Subroto	Active
755	Sherly	Expired
756	Callista	Expired
757	Jeanice Madeleine Kwok	Expired
758	Sofia Lukman	Expired
762	Hogan Calixto Huang	Expired
763	Safira Reynia Hanum	Active
766	Frincelia Wijaya	Expired
767	Theodore Joachim Wihardjo	Active
769	Joyce Yang	Expired
770	Emma Gozali	Expired
776	Eason Niklaus	Expired
775	Clarissa Amberlyn	Expired
772	Joleen Chen	Expired
771	Jileen Chen	Expired
777	Audrey Victoria Lim	Expired
778	Christian Beryl Sinuhaji	Expired
779	Jayden Tarmidi	Active
780	Steven Nicholas Halim	Expired
782	Hana Sophia Alice	Expired
781	Savannah Zoe Wijaya	Expired
783	Evelynn Lee	Expired
785	Kelly Alyse Tanary	Active
786	Shelline Sutanto	Expired
787	Shahnaz Shirendia	Expired
788	Mhd Farid Athallah Hasibuan	Expired
790	Hardey Moeldoko Law	Expired
791	Eduardo xaviero bingei	Expired
792	Hubert Bryan	Expired
793	Grace Kelly	Expired
794	Judyth Annabelle Naulibasa	Expired
795	Avelynn Wijaya	Expired
796	Ashton Howie	Expired
799	Meredith Adlian	Expired
800	Xavier Orlando Boe	Expired
801	Hillary Calista Tamado Panjaitan	Active
802	Arthur Kendrick Zhuang	Expired
803	Lovea Fendy Kho	Active
804	Rebecca Iewanto Xu	Expired
805	Jevan Sean Vertio	Expired
806	Efrata Iskandar Liunardi	Active
807	Tristan Jacob	Expired
808	Gareth Brilliant Lim	Expired
809	Emilia Niko Nyoman	Active (Grace Period)
810	Jayden Tanadin	Expired
811	Arthur Floyd Salim	Active
812	Lorenzo Margo Jap	Expired
813	Kimmy Tjanaka	Expired
814	Navarro Lim	Expired
815	Alicia Oranie Depari	Expired
816	VICTORIA ALBERTA ZHENG	Expired
817	Nicho Chandra Vimalanetra	Expired
818	Naomi Alexis Supangat	Expired
819	MARIA JILL LUMBANTORUAN	Active
820	Alexander Alberta Zheng	Expired
821	Vallerio	Expired
822	Clarissa Olivia Anne Lammora Panjaitan	Active
823	James Bryan Tantono	Expired
824	Septiana Katelyn Sharon Sinaga	Expired
825	Grace Elizabeth	Expired
826	Darren Wilson	Expired
827	Aldrich Reynard Atmadi	Expired
828	Elvano Reynard Atmadi	Expired
829	Zhafir Gantari	Expired
830	Justin Junior	Expired
831	Ryan Hugo Purnomo	Expired
832	Allessandra J Lee	Expired
833	Quin Adrianna	Expired
834	Mario Charlie	Expired
835	Finn Aldrich Luman	Active
836	Kent Arthur Luman	Active
837	Clairine Angela Indrajaya	Active
838	Louis Harvey Soesanto	Active
839	Caitlyn Bianca Tjiaman	Expired
840	Cullen Brian Tjiaman	Expired
841	Jocelyn Jolie Tainiady	Expired
842	Ethan Moeritz	Active
843	Jenessa Effendy	Expired
844	Callista Stacy Lim	Expired
845	Wallace Evencio	Active (Grace Period)
846	Stevaldo Verino Oursun	Expired
847	Claudia Catherine	Expired
848	Ethan Fernandez Yap	Expired
849	Wilbert Limin	Expired
850	Karin Destynsia	Active (Grace Period)
851	Tiffany Taniwan	Expired
852	Cellistia Cangdiago	Active (Grace Period)
854	Chiara Vallerie Jie	Expired
855	Cayden Louis Auwrich	Active
856	Carissa Catherine	Expired
857	Hogan Chan	Active
858	Delmond Osyan Sudilan	Active
859	Clarissa Kho	Active
860	Michelle Yap	Expired
861	Cyndi Ramaly	Expired
862	Calvin Ramaly	Expired
863	Bonita Gaudeti Sinaga	Active
865	Victoria Yap	Active
866	Carlsen Simen	Active
867	Cherlyn Simen	Active
868	Sergio Garcia Ang	Expired
869	Fleurette Celestine Lee	Expired
870	Karen Hazel Liu	Expired
871	Ryant Anthoney Lim	Expired
872	Kenneth Samuel Lim	Active (Grace Period)
873	Ozil Ramadhan Hutasuhut	Expired
874	Muhammad Rafli Arkan	Expired
876	Jacqueline Vallerie Chen	Expired
877	Jenica Zealand Feng	Expired
878	Bianca Maldiva Feng	Expired
879	Jolin Vander Cia	Expired
880	Joel Edward	Active (Grace Period)
882	Justin Chen	Expired
883	Joanne Lynch	Active
884	Starley Valero Gozali	Expired
885	Skylar Valdesto Gozali	Expired
886	Jazzlyn Javeni	Expired
887	Filia Cielo Lim	Expired
784	Garrix Ardent Putra	Active
888	Celine Chastine Angkasa	Expired
889	Madelyn Odelia Lowis	Active (Grace Period)
890	Eunice Grace	Expired
891	Jayxvier Keegan Chuwardi	Expired
892	Edward Nursalim	Expired
893	Prajna Nursalim	Expired
894	Sudatta Nursalim	Expired
895	Michelle Angelina Yip	Expired
896	Nicolas Carlie Kuwira	Active
897	Valerie Ivana Chen	Active
898	Ricson Stanlay	Active
899	Jay Ven	Expired
900	Nicole Carmen Chang	Expired
901	Elaine Velicia	Expired
902	Malcolm	Active
903	Harvey Oliver Lee	Active
904	Callista Aurelia Tasma	Active
905	Carissa Aurelia Tasma	Expired
906	Dario Oscar Zhong	Expired
751	Howie Chan	Active
907	Emma Valerie Pang	Expired
908	Averynn Marcia Pang	Expired
909	Keona Jaileynn Lawrence	Active
910	Michael Thamida	Active
911	Meivellynn Thamida	Active
912	Alfred Benyamin Leidin	Expired
913	Roselie Kirana Wijaya	Active
302	Eduardo Bingei	Expired
375	Darren Gabriel	Active
546	Adelynne	Expired
759	Warren Emanuel	Expired
760	Richard Zheng	Expired
761	Richelle Zheng	Active
768	Josh Seravino Zhang	Expired
914	Leia Kaytlyn Tioe	Active (Grace Period)
915	Rachel Darlyn Udjaja	Expired
916	Valentino Nauli Basa	Expired
917	Harlex Tjengdekia	Expired
918	Fayee Abqaira Putrigian Sinambela	Expired
922	Victoria Cenata	Active
924	Ethan Elka Suyento	Expired
925	Quinn Felicia Foo	Expired
926	Arthur Ignatius Carrari	Expired
927	Richela Stanlay	Active
928	Victoria Roesli	Expired
929	Trevor Hartono Lee	Active
930	Celine Nichola Xie	Expired
931	Zealand Charvi Nathang	Expired
932	Olivia Tjoa	Active
933	Ivy Jeane Chanella	Active
934	Zac Anthony Chua	Expired
935	Gisella Nyoto	Active
937	Jillian Claire Kuanrius	Active
938	Reagan Nyoto	Active
939	Rexcaden Jazper Shu	Active
942	Elaine Viandi	Active
944	Kent Aldrich Huang	Expired
945	Angeline Felice Theo	Active
946	Ryufin Junus	Expired
947	Nayyara Ayaskara Prakasita	Active (Grace Period)
948	Erick Winner Teo	Expired
949	Amelia Irawan	Expired
950	Audrey Madison Loewe	Active
951	Mavin Jericho Phen	Active (Grace Period)
952	Louis Alvaro Wang	Expired
953	Chloe Valencia Wang	Expired
954	Ammiel Malikha Lamria	Expired
955	Naomi Grace Edward	Expired
956	Aileen Sophie Kesuma	Active
957	Rafifa Aisha Mahira	Expired
958	Raisya Putri Raharjo	Expired
959	Aleyna Chandra	Expired
962	Ananda Putera Ngadiman	Active
963	Yasmina Athirah Rifqi	Active
964	Yazeed Abizar Rifqi	Active
965	Modric Agusta Daruma	Active
967	Eko Suherlim	
969	Lady Valery Sinambela	Expired
970	Jordan Keegan	Active
971	Annabela Himeko Winarta	
973	Darren Javier Wu	
977	Micha Belle Tan	Expired
978	Clara Jill Valerie	Expired
980	Ezio Lim	Active
981	Joey Milan Phen	Active
982	Abigail Hazel Tamin	Active
983	Jashton Tokyo	Expired
984	Chaden Ettienne Halim	Active (Grace Period)
986	Jason Allen Tjoa	Active
987	Caren Pandiago	Active
988	Gavyn Wijaya	Active
989	Federico Fredelyn Jeoh	Active
990	Zason Riady Ko	Active (Grace Period)
991	Arya Kho	Active
992	James Ananda Wijaya	Expired
993	Miranda Belle Tan	Expired
994	Valisha Sofi Tjandra	Active
995	Qori Putri Syahviah	Active
996	Venesia Anggini Purba	Active
997	Jovin Limcoln	Expired
998	Fedrick Wijaya	Expired
999	Annabelle Grace Wu	Active
1000	Chloe Sinjaya	Expired
1001	Hanson Nicolas Chandra	Expired
1002	Hubert Ulrich Tan	Expired
1003	Arthur Alexander Hakim	Active
1004	Vederrick Ethan Jap	Expired
1005	Gisella	Expired
1006	Jerico	Expired
1007	Davina Grace Ong	Active (Grace Period)
1008	Sydney Princessa Lim	Active (Grace Period)
1009	Felicia Grace Ong	Active (Grace Period)
1010	Gracielle Grace Ong	Active (Grace Period)
1011	Clarence	Expired
1012	Clarence Aurelia Colim	Expired
1013	Michelle Kalyani	Expired
1014	Catherine Gotami	Expired
1015	Fransisca	Active
1017	Harvardo Lovenzo Susanto	Active
1018	Freddy Salim	Expired
1019	Louis Clinton Chai	Active
1020	Caren Axella Natania Lumbantoruan	Active
1022	Efraim Lucas Dimitri	Active (Grace Period)
1023	Darryl Raynold Leowe	Expired
1024	Chloe Audrey Chen	Active
1025	Hermione Lovely Susanto	Active
1026	Angelina Novita Chandra	Expired
1027	Elnino Jehanra Saragih	Active
1028	Darren Winston	Expired
1034	Cherryl Riquelme Potan	Active (Grace Period)
1029	Luna Antoinette Linne	Active
1030	Valerie Rosalyn Yap	Expired
1031	Jacques Lewinsky	Active
1032	Joey Celine	Expired
1033	Shelvina Howie	Active (Grace Period)
1035	Adeline Luhur	Expired
1036	Verencia Alden	Expired
1037	Caitlyn Allison Yaphen	Active
1038	Devon Jau	Active (Grace Period)
1039	Naafa Maisyva Ginting	Expired
1040	Shane Anastasya Kristy Simangunsong	Active
1041	Chloe Taydey	Active (Grace Period)
1042	Maydelyn Zhang	Expired
1043	Kenrich Thantio Yangderson	Active
1044	Dominic Kie	Active (Grace Period)
1045	Silvario Soedidjo	Active (Grace Period)
1046	Max Wayne Subroto	Expired
1047	Jordan Tanutama	Active
1048	Reynard Lis	Expired
1049	Rafael Maximillian Sitorus	Active (Grace Period)
1050	Galang Roland Besch	Active (Grace Period)
1051	Timothy Anwi Panca	Active
1052	Carlene Yang	Expired
1053	Elaine Clemence Annabell	Active (Grace Period)
1054	Renata Allie Rusli	Expired
1055	Reginald Ali Rusli	Expired
1056	Yeslin Yap	Active (Grace Period)
1057	Louis Xavier Leonardi	Active
1058	Gracia Tiffany Susanto	Active
1059	Meuthia Gadiza	Active
1060	Zac Aldrich Mayor	Active
1061	Kayden Skylar Sanso	Active
1062	Queensya Lovely Reya	Active (Grace Period)
1063	Nicole Beh	Expired
1064	Morgan Beh	Expired
1065	Maxwell Louis Jaya	Active
1066	Samuel Christopher Halim	Active
1067	Richester Casvio Liong	Expired
1068	Hiero Haydenzo Huang	Expired
1069	Kartrine Sathya Felim	Expired
1070	Krishna Dhammo Felim	Expired
1071	Chloe Aurelia Ten	Active
1072	Hazel Natalie Ten	Active
1073	Scarlett Avery Ten	Active
1074	Ayska Najya Prakasita	Active
1075	Bryan Michael Ng	Active
1076	Brayden Matthew Ng	Active
1077	Alqueenza Syifa Winona	Active
1078	Ethan Kenny Daruma	Active
1079	Keigo Kusuno Soh	Active
1080	Reynara Amber Koiman	Active
285	Clairine Joshanley	Active
1081	Carlton Kho	Active
1082	Davin Obert Khoo	Expired
1083	Gillian Alexa Pearl	Active
1084	Leonard Nyoto	Active
1085	Garent Nyoto	Active
1086	Kayden Ethan Zhou	Active
1087	Nicole Eunice Lautan	Expired
1088	Alesha Sofia Andhika	Active
1089	Jessica Jo	Active
1090	Healey Tjoe	Active
1091	Jennifer Othniella Situmorang	Expired
1092	Jill Madison Ali	Expired
1093	Annastasia Hideko Winarta	Active
1094	Howard Richer Thia	Expired
1096	Maxwell Kenson Wibisono	Active
1097	Reia Rose Winfield	Active
1098	Naia Sydney Winfield	Active
1099	Cleva Levica	Expired
1100	Khansa Salsabila	Expired
1101	Fredella Alexa Maranggi Siregar	Active
1102	Adhyasta William Nugroho	Active (Grace Period)
1103	Nicholas Tjin	Active
1104	Abbygael Mikaela Tangelyn	Active
1105	Keiko Aiby Lim	Active
1106	Vierra Cleevany Ryu	Active
1107	Gwyneth Louisa Yap	Active
1108	Zea Alesha Rizki	Expired
1109	Princess Latheefa Azzura	Expired
1110	Aaron Yang	Expired
1111	Howie Leonard Wijaya	Expired
1112	Maynard Jeremiah Simarmata	Expired
1113	Joe Benedict Japto	Active
1114	James Tjoa	Expired
1115	Reagan Oliver Zhuang	Active
1116	Kim Megumi	Active
1117	Claire Gabrielle Oscar	Active
1118	Reagan Thierry Wijaya	Active
1119	Andrea Dimitri Ashraafi Lazzaroni	Active
1120	Reynand Wijaya	Active
1121	Liam John Rickson	Active
1122	Leeanne Jane Lim	Active
1123	Joequinn Felysse Warsono	Active (Grace Period)
1124	Felicia Liangso	Active
1125	Grace Anastasia Zeng	Active
1126	Yedidyah Mikaela Erina	Expired
1127	Edric Luiz Ongka	Expired
1128	Lashira Awbinsriee Pane	Active
1129	Stephanie Evelyn Luo	Active
1130	Ethan Ray Maxwell	Expired
1131	Vinxiero Carrick Francoiz	Active (Grace Period)
1132	Nicole Lee	Active
1133	Natalie Willeen Zhang	Active (Grace Period)
1134	Kent Nanda Daruma	Active (Grace Period)
1135	Cherysse Auryn Khobert	Active
1136	Ernesto Zedden Wirawan	Expired
1137	Celine Angeline Yiandri	Active
1138	Mike Louis Wijaya	Active
1139	Wilbert Wijaya	Active
1140	Keita Raelyn Deng	Active
1141	Joyce Nathania Shen	Active
1142	Oscar Linwood	Active
1143	Rico Alvaro Chandra	Active
1144	Kayla Shilyn Gani	Active
1145	Gallen Yuman King	Active
1146	Charis Yafa Tobing	Active
1147	Calista Kasih Aprilia Harahap	Active
1148	Talysha Sri Nayla	Active
1149	Arnold Alexander Hakim	Active
1150	Kellyn Chandra	Active
1151	Theona Zefanya Purba	Active
1152	Javerson Joshua Tobing	Active
1154	Aca Raymond Tjemerlang	Active
1155	Howard Winston Louis	Active
1156	Alika Zelmira Wibowo	Active
1157	Gywen Stefanie Wiley	Active
1158	Kendrick Eoghan	Active
1159	Kezia Zenitha Sinaga	Active
1160	Karen Kallenia Sinaga	Active
1161	Randa Miracle Boasly Sihombing	Active
1162	Carine Susanto Lie	Active
1163	Azarine Apriza Darmawan	Active
1164	Felicia Ivana Silalahi	Active
149	Elaine Velicia	Active (Grace Period)
968	Lady Valery Sinambela	Active
1165	Madeline Lauren	Active
1166	Anderson Putra Supama	Active
1167	Fredericka Sigalingging	Active
1168	Viorencia Tantana	Active
1169	Gisellene Lowisuri	Active
1170	Kaylynn Zhanghoven	Active
1171	Angelina Cenata	Active
27	Valerie Legolas Cen	Active
1172	Ferdian Zulkarnain	Active
1173	Mia Emily Soeripin	Active
1174	Vivienne Claire Soeripin	Active
1175	Vingeline Chelsealya Angkasa	Active
1176	Jean Catherine Anneliese Sebayang	Active
1177	James Edward Lie	Active
1178	Richeline Huang	Active
1179	Livi Celia Lim	Active
1180	Hariwell	Active
1181	Azzam Al Vanka	Active
1182	Stella Wijaya	Active
1183	Maxwell Utomo	Active
1184	Louis Sinclair Zuary	Active
1185	Genovia Grace Widjaja	Active
1186	Ray Yudhistira Ng	Active
1187	Michelle Aurelia Chen	Active
1188	James Oliver Coaca	Active
1189	Kennan Eito Shankara	Active
1190	Nalina Vimala	Active
1191	Joya Vania Silaen	Active
1192	Sergio Ronald Utomo	Active
1193	Cheryl Eilyn Affandy	Active
1194	Max Kingston Marzuki	Active
1195	Kenzo Wibowo Marzuki	Active
1196	Grace Martok	Active
1197	Adzkiya Kyona Mahendra	Expired
1198	Jovan Jonathan Cen	Active
1199	Joey Jonas Cen	Active
1200	Jayden Darren Wijaya	Expired
1201	Ivania Gracesinka	Active
1202	Cornelius Wilfred	Active
1203	Kevin Fico Aurelio	Active
1204	Kendrick Filbert Aurelio	Active
1205	Kaylee Alessia Ridgen	Active
1206	Daniel Haryanto	Active
1207	James Jayden Chandra	Active
1208	Dwayne Alvaro Phen	Active
1209	Michele Cecilia Belvania Saragih	Active
1210	Joycelyn Annabelle	Active
1211	Dion Lorenzo Castio	Active
1212	Aurelia Wyanto	Active
1213	Kaylee Wayne Laong	Active
1214	Fiona Tjongnata	Active
1215	Julfini Chu	Expired
1216	Marc Maximus Zhang	Active
1217	Daxton Lie	Active
1218	Odilia Alexandra Yang	Active
1219	Naviauly Dolorosa Sinaga	Active
1220	Kinara Caliezia Pangestu	Active
1222	Hans Andersen Yap	Active
1223	Steve Marcellino	Active
1224	Collins Anderson	Active
1221	Cika Linatasia Tampubolon	Active
1225	Winnie Lorenz Tjialin	Active
90100001	Rowan Maverick Ang	Active
90100004	Jeovenna Cangie	Active
90100005	Felynn Holy Richson	Expired
90100006	Kenzie Rowland Huangdinata	Expired
90100007	Carrick Classico	Active
90100008	Michelle Teochan	Expired
90100009	Marchelline Teochan	Expired
90100010	Chloe Marjorie Wen	Active
90100011	Chloe Quisha Anggara	Active
90100013	Candice Julian Sakiwa	Active
90100014	Claire adelynn wu	Expired
90100015	Clarissa Felicia Chandra	Expired
90100016	Rodrigo Lorenzo	Expired
90100017	Clarabelle Louisa	Expired
90100019	Kendison Anggriawan	
90100020	Winston Hubert	Active
90100021	Aidan	Expired
90100022	Jeanice Wu	Active
90100023	Brooklyn Svenrich Ang	Expired
90100024	Welceline Charissa Tsjin	Active (Grace Period)
90100027	Stacie Weng	
90100028	Haylee Weng	Expired
90100029	Yuri Chan Rachmat	
90100030	Helen Chan Rachmat	
90100031	Marvel Chan Rachmat	Expired
90100032	Rohan Chan Rachmat	Expired
90100033	Matthew Dunston Halim 	Expired
90100034	Quinsha Charlyn Ow	Expired
90100035	Carlen Edeline Br. Keliat	Active (Grace Period)
90100036	Carlos Ferdinand Putra	Active
90100037	Bosstin Moses Tio	
90100038	Adrian Gotama	
90100039	Reynard Alderich Guntur	Active
90100040	Genevieve chen	
90100041	Philips	Expired
90100042	Justin Nawi	Active
90100043	Valentino owen liu	Active
90100044	Velove Alexa Winstan	Active
90100045	david howard	Active
90100046	Hugo Maximus Ling	Active
90100047	Bryant Maximus Ling	Active
90100048	Christian Nathaniel Hidayat	
90100049	Harvey Susanto	Active
90100055	Felicia Tham	Active
90100056	Thalissha Yeonan	Active
90100057	Edward Lie	Expired
90100058	Najla putri yosifa	Expired
90100059	Jared Nawi	Expired
90100060	Alfred Smaver Tanasal	Active
90100002	Giselle Liandy	Active
90100025	Celine Devina Guo	Expired
90100026	Winston Guo	Expired
90100061	Elaine Gabriella Chandella	Active
90100062	Cherish Graciella Chandella	Expired
90100063	Fraderic milerlim	Expired
90100064	Olson Arfayo	Active
90100065	Richia Dominic liawfanny	Expired
90100066	Celine Oubre	Active
90100067	Victor Alexander Winstan	Active
90100068	Ixchel Lowell Tankiono	Active
90100069	Erynn Maxine Lau	Expired
90100070	Jack Austin Sia	Active
90100071	Kevin Declan Kusumo	Expired
90100072	Kenji Ryo Kusumo	Expired
90100074	Faulina theresia pangaribuan	Active
90100075	Kingsley Alisson Tenang	Active
90100076	Carolline Jackqueen Cen	Expired
90100077	Olivia Lincoln	Expired
90100078	Gracella Cangie	
90100080	Vanessa Cangie	Active
90100081	HAYDEN FREDDERICK HALIM	Active
90100082	Tang en xin	Active
90100083	Filbert Laithen	Active
90100084	Warren Nicholas Khu	Expired
90100085	Frederico sanrio sanjaya	Expired
90100086	Eric Williarn	Active
90100087	Finn maxwell	Active
90100088	Khairiy Raka azizi Hermansyah	Active
90100089	Alvyn Zhu	Active
90100090	Alfarizy raqila hermansyah	Active
90100091	heidi tanamin	Expired
90100092	Adlyansah Rizki Tiloli	Expired
90100093	Jesslyn lee	Expired
90100094	Feliks Ananda Lee	Expired
90100097	Annabel Audriana	Active
90100098	Meghan Hailey Hidayat	Expired
90100099	Rowan Tirta Lee	Expired
90100100	Jasmine zhang	Active
90100101	Jayden zhang	Active
90100102	Chloe Marche Khu	Active
90100103	Claire Eugenia Khu	Active
90100104	Hannah Sophia Salim	Active
90100105	Angelica Makro	Expired
90100106	M Rasya Dalimunthe	Expired
90100107	Stoffel swandeez angkasa	Active
90100108	VERGIO GAVINO CHAIKOFF	Active
90100109	Jolin Thianda	Active
90100110	Cedric Max Osmond	Expired
90100111	Victoria Chandra	Expired
90100112	Richie Alvaro Tandinata	Active
90100113	Reynard Shendior	Active
90100114	Kate Elizabeth Huang	Active (Grace Period)
90100115	William Lauda	Active
90100116	Janessa Hofang	Active
90100117	Jarell Hofang	Active
90100118	Jesslyn Hofang	Active
90100120	Jocelyn Sydney	Active
90100121	Aileen Alfina Susanto	Expired
90100122	Tiffany Toh	Active (Grace Period)
90100123	Trevor Toh	Active (Grace Period)
90100124	Michael James Tantao	Expired
90100125	Matthew James Tantao	Expired
90100126	Cherryl Angelia Sandy	Expired
90100127	Davin Bradford	Active
90100128	Dustin Bradley	Active
90100129	Jasmine Ryana Ngadimin	Active
90100130	Maurice Claire Genevieve	Active (Grace Period)
90100131	GILLIAN NATALIE WILFRED	Active
90100132	Louis Adrian	Expired
90100133	Josh Andrew	Expired
90100134	Rodrick Stefano Halim	Active
90100135	Rainie Lynn	Active
90100136	Miho Qanitah Sihombing	Active
90100137	Keiko Hanara Sihombing	Active
90100138	Vyon Wynter Huang	Active
90100139	Mikayla Seline Wu	Active
90100140	JADELLYNE GRETCHENAGATHA ZHUOTIO	Active
90100141	CARRIE PRISCILLA FIGO	Expired
90100142	Priscilla vidarlin	Expired
90100143	Jason Lewis Theo	Active
90100144	Vincenzo	Active
90100145	Viona Bellavania Birgitta	Expired
90100146	Selena Frederica Castalia	Active
90100147	Griffin Theodoric	Expired
90100148	Kei Evander Buhari	Active
90100149	Stevanie Angel Gunawan	Expired
249	Emily Santo	Active
90100150	Graciella Wiselie	Expired
90100151	Warren Tandias	Expired
90100152	Shirleen Nyrtle	Expired
90100153	Ethan Putra Gotama	Active
90100154	Emmeline Aurelia Lie	Active
90100155	Nathan Archie Gunawan	Active
90100156	Nicole Anastasia	Active
90100157	Jean kelly samudra tjuaja	Expired
90100158	Gwen vidyatan	Expired
90100159	Keagan Leonard Kusumo	
90100160	Klarissa Evania Buhari	Active
90100161	Harvey Taufik	Active
90100162	Adrian Soh	Expired
90100163	Videline Gillian Chaikoff	Expired
90100164	Jarred Eldridge Tantama	Expired
90100165	Muhammad Alby Azka Lubis	Expired
90100166	Reinz Stythan	Active
90100167	Alicia Quinn chandranata	Expired
90100168	Madelyn Henryetta Fang	Active
90100169	Eleora Iskandar Liunardi	Active
90100170	Viyona Gavriela Muis	Expired
90100171	Eileen Yui Chen	Expired
90100172	Michi Amira Sukmana	Expired
90100173	Jeneiro	Active
90100174	Otto Valerino Lim	Active
90100175	Jovan Leonard Lui	Expired
90100176	Rahma Nakita Afifah	Active
90100177	Dominica Cherish Sheiramoth	Expired
90100178	Miracle Huang	Active
90100179	Emily Moraine Hakim	Active (Grace Period)
90100180	Jayden jiefferson	Expired
90100181	Madeleine Cendana	Active
90100182	MAXWELL TENAR	Active (Grace Period)
90100183	Heinz victorio zhou	Active
90100184	filbert sonata	
90100185	Natasha Clairine Wu	Expired
90100186	Samantha Clairine Wu	Expired
90100187	Jayden Jo Lie	
90100188	Rebecca kelly ashari	Expired
90100189	Abigail avery ashari	Active
90100190	Daphne Nathania Ang	Active (Grace Period)
90100191	Bosco Lim	Active (Grace Period)
90100192	Jayden Jingga	Active
90100193	Tyra Louise Tohnika	Active (Grace Period)
90100194	Tyler Howard Tohnika	Active
90100195	Sarah Oktorela Sitorus	Active
90100197	Jeffrey Yap	Active
90100198	Jordan Swiss Cliftan	Active
90100199	Steve Mason	Active
90100200	Galent hansen wuner	Active
90100201	Crystaline Angela indrajaya	Active
90100202	Xavierra Kaylyn Leeon	Active
90100203	Clarice Valenzka Wijaya	Active
90100204	Chloe Wong	Active
90100205	Bernice Wong	Active
90100206	Metta Louise ellen	Active
90100207	Darynne Clarabelle Yuan	Active
90100208	Patricia	Active
90100209	George	Active
90100210	Wilbenzs Howard	Active
90100211	Callista Aurelia alven	Active
90100212	Quinn Rachel Liu	Active
90100213	Seabert Swandeez Angkasa	Active
90100214	Louis kendrick	Active
90100215	Phebe Lalita	Active
90100216	Jollyne Gretchenavery Zhuotio	Active
90100217	CHARLIE MIKKELSEN YAP	Active
90100218	Phebe Diorra Salim	Active
90100219	Destine Diorra Salim	Active
90100223	Feodora Meidy Leandra	Active
90100221	Ryan Aurelio Bustamin	Active
90100226	GEORGE FENDISON	Active
90100231	Queenza Theodora Wijaya	Active
90100230	KYGO LAY	Active
90100232	Kathrine Chrestella	Active
90100233	Sam Lincoln Kane	Active
90100236	WINSTON XAVERIUS JUNIO	Active
90100239	JOYXE ADELINE WISELY	Active
90100224	Hillary Quinn	Active
90100240	Alpine Miler Luo	Active
90100242	Beverly Mandy Tjoeng	Active
90100244	Rozelle Xiera	Active
90100245	Mason Ivander Cahaya	Active
90100246	Felice limandar	Active
90100247	Garcia limandar	Active
90100229	HEUGER LAY	Active
90100227	Richard Edbert Susantio	Active
90100235	Hermione Emmilia Artjim	Active
90100238	Sean Alexio xanderv	Active
90100243	Ryuichi loury 	Active
90100248	Richie Wong Yon Chuang	Active
90100249	Ahmad Hanif	Active
90100250	Aldrich Smaver Tanasal	Active
90100251	Felix Austin Lumbantobing	Active
90100252	Alleluia Elyona Sitohang	Active
90100253	Ruby Faustin Amat	Active
90100254	Reagan Alberic Guntur	Active
90100237	Callista Aurora Welopo	Active
90100225	Richelle lim	Active
90100228	Hanson julio tanadi	Active
90100234	Lionel evander jayadi	Active
90100241	Jeremy Arthur Anggriawan	Expired
90100255	Felicia Fransisca	Active`;

async function updateDatabase() {
  try {
    await db.query(`ALTER TABLE link_report ADD COLUMN IF NOT EXISTS status VARCHAR(100);`);

    const lines = tsvData.trim().split('\n');
    const defaultTerm = 'May 2026 - Jun 2026';

    // Deduplicate entries by trainee_id
    const map = new Map();
    for (const line of lines) {
      const parts = line.split('\t').map(p => p.trim());
      if (parts.length >= 2) {
        const trainee_id = parts[0];
        const nama = parts[1];
        const status = parts[2] || null;
        if (trainee_id && nama && trainee_id !== 'ID') {
          map.set(trainee_id, { trainee_id, term: defaultTerm, nama, status });
        }
      }
    }

    const records = Array.from(map.values());
    console.log(`Unique ID-Nama-Status mappings to process: ${records.length}`);

    // Perform batch upsert in chunks of 100
    const chunkSize = 100;

    for (let c = 0; c < records.length; c += chunkSize) {
      const chunk = records.slice(c, c + chunkSize);
      const valueStrings = [];
      const queryParams = [];
      let paramIdx = 1;

      chunk.forEach(row => {
        valueStrings.push(`($${paramIdx}, $${paramIdx+1}, $${paramIdx+2}, $${paramIdx+3})`);
        queryParams.push(row.trainee_id, row.term, row.nama, row.status);
        paramIdx += 4;
      });

      const batchQuery = `
        INSERT INTO link_report (trainee_id, term, nama, status)
        VALUES ${valueStrings.join(', ')}
        ON CONFLICT (trainee_id, term) DO UPDATE SET
          nama = EXCLUDED.nama,
          status = COALESCE(EXCLUDED.status, link_report.status);
      `;

      await db.query(batchQuery, queryParams);
      console.log(`Processed chunk ${c / chunkSize + 1} (${chunk.length} records)`);
    }

    // Verify final stats
    const totalRes = await db.query('SELECT COUNT(*) FROM link_report');
    const withNameRes = await db.query("SELECT COUNT(*) FROM link_report WHERE nama IS NOT NULL AND nama != ''");
    const withStatusRes = await db.query("SELECT COUNT(*) FROM link_report WHERE status IS NOT NULL AND status != ''");
    const withDriveRes = await db.query("SELECT COUNT(*) FROM link_report WHERE link_term IS NOT NULL");
    const withYtRes = await db.query("SELECT COUNT(*) FROM link_report WHERE link_youtube IS NOT NULL");

    console.log('\n=========================================');
    console.log(`🎉 SUCCESS! Database update complete.`);
    console.log(`📊 Total rows in link_report: ${totalRes.rows[0].count}`);
    console.log(`👤 Rows with Name (nama): ${withNameRes.rows[0].count}`);
    console.log(`🏷️  Rows with Status (status): ${withStatusRes.rows[0].count}`);
    console.log(`📁 Rows with Google Drive link: ${withDriveRes.rows[0].count}`);
    console.log(`▶️  Rows with YouTube link: ${withYtRes.rows[0].count}`);
    console.log('=========================================\n');

    // Show sample rows
    const sample = await db.query('SELECT trainee_id, nama, status, term, link_term, link_youtube FROM link_report LIMIT 5');
    console.log('Sample rows:', sample.rows);

    process.exit(0);
  } catch (err) {
    console.error('Error updating database:', err);
    process.exit(1);
  }
}

updateDatabase();

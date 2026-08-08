const db = require('./src/db/neonClient');

const rawInput = `ID	Name
20	Nicholas Matthew Halim
21	Novriciella Carina Luthan
22	Candice Chrystalline Liangrich
23	Jivaka Putra
24	No registration
25	Erich Legolas Cen
26	Bryan Legolas Cen
27	Valerie Legolas Cen
28	Raynard Fausta
30	Chris Yochanan Wu
31	Hans Sozo Wu
32	Jacqueline Tjia
33	Candise Natalie
34	Megan Pindian
35	Jesslyn Odelia Thio
36	Giselle Titania
37	Keona Jane Viriya
38	Jave Liong
39	Ryanne Shiven
40	Jesaya Tara
41	Clement Sanusi
42	Aaron Sebastian Willson
43	Petra Zoe Khoman
44	Stella Edlyn Kwok
45	Aaron Goldwin Semarak
46	Marco Freddie Tjiaren
47	Martin Leandro Limero
48	Justin Maxwell
49	Richmond Osyan Sudilan
50	Kenichi Zhou
51	Cedric Yago
52	Cheryl
53	Arilynn Wijaya
54	Grisvian Tandy
55	Justin Rusly
56	Filbert
57	Averina Liv Valerie Moiras
58	Brentnico Chen
59	Raynald Yu
60	Sharleen Velicia Lim
61	Kenneth Aurelio Bustamin
62	Stephanie Ivana Salim
63	Cleona Vivienne Lim
64	Jillian Rusly
65	Gelsey Megan Chaniya
66	Ivaldo Juanda
67	Claryce Annabelle Yu
68	Othniel Rolando Manson
69	Vivian Khu
70	Selly Salim
71	Amanda Gracie Onggo
72	Kimberly Howanta
73	Jason Marco
74	Ariel Lucius
75	Paul Simanjuntak
76	Michael Cahyadi
77	Valerie Doreen Kwerier
78	Valerie Ann
79	Madeleine Lee
80	Neo Freddiego Chen
81	No registration
82	Nicole Mila Khoman
83	Nicholas Siregar
84	Naomi Siregar
85	Shafira Gladys
86	Elysia Pasaribu
87	Ellyse Sigalingging
88	Nehemia Asadika Tumogihon Saragih
89	Chelsea Grace Cantika Pasaribu
90	Kayla Udrey
91	Dave Meliala
92	Carissa Meliala
93	No registration
94	Flint Oliver
95	Wilbert Hartianto
96	Hudson Fulviano Sentosa
309	Luiz Alvaro Diego
331	Vellica Benarissa Tanjaya
339	Ellen Angelica
29	Muhammad Athallah Rafif Ulhaq
125	Jayxen Maxwell
128	Felice Naomi Tjiaren
126	Ellwed Layrence
127	Stefan Song
132	Morris Claudius
129	Suci Nurhaliza
130	Anastasya Sofie Yohan
133	Oedia Ruth Vania
134	Madeline Lim
135	Celine Meganz Wijaya
136	Claudine Joshanley
137	Jovian Livio
140	Walfred Aurelio Wijaya
141	Russell William Tanner
139	Johnson Tanako
138	Bryan Frederick Wijaya
144	Reagan Maxzen Kanawa
147	Jovianne Christa Xie
145	Josh Brian Setiawan
146	Raymand Wilbert Wijaya
148	Bryan Velerian
149	Elaine Velicia
151	Kenshiro Leowardy
152	Welton Padmoasmolo
290	Daniel Maranello Winata Winata
234	Jacky Wu
236	Calvin Wijaya
238	Venesya Evelyn Tiawan
239	Shania Josevine
240	Ricko Wu
241	Revandeiss Putrameka Beruh
246	Brianne Antoniette Wibowo
247	Bernice Annabelle Wibowo
248	Jayden Matthew Joe
249	Emily Santo
250	Ryan Eagan Cendana
261	No registration
266	Felicia Tjiawijaya
272	Jocelyn Basirun
273	Joy Tan
274	Candice Winardi Wong
275	Eugenia Joanne Kie
276	Florencia Oria
410	Dyra Muntazsirah
286	Jocelyn Oria
287	Starlin Oria
288	Carisle Vee Lovel
291	Darrell Richard Sen
292	Dylan Raynald Sen
293	Felice Meganz Wijaya
302	Eduardo Bingei
303	Lucas Zhang
304	Louis Zhang
306	Rowen Reynaldo
308	Nicholas Yanwar
310	Warren Voss Khoman
318	Ellena Jocelyn Lasiman
320	Andrene Metta Leo
321	Devan Angkasa
322	Eagan Hsiao
324	Yujiro Cokro
328	Jessica Evangeli Tjiawijaya
329	Vrederick Benaricco Tanjaya
330	Avril Valerie Tjhe
332	Carlisse Anastacia Liang
333	Jasmine Yenarti
334	Milliana Joan
335	Kathleen Maria Isabel Sagala
342	Louiselynn Nurimba
368	Felice Vallerie Angkasa
374	Clarice Aurelia Fuwynn
380	Valerie Jeanne Mandera
390	Maximilian Evan Tanujaya
393	Jelysha Soekendar
394	Jemiko Soekendar
395	Maverick Winata
396	Matthew Candiof
398	Elbert Reagan Tevix
399	Shannon Calista Tevix
400	Richard Axel Tjhe
405	Graciella Madeline
433	James Oliver Neoman
438	Brielle Xaviera
440	Sofia Grace Wu
441	Kenzie Fernando Hugh
491	Audrey Theona Law
499	Halisna Ronauli Sinaga
511	Amarissa
512	Fione
513	Anabell
517	Jack Travis Lee
518	Joe Jasper Lee
519	Valencia Wibowo
520	Falen Novelie
521	Taryn Tjan
525	 
528	Kiery Keionna Kie
529	Rodrique Owen Salim
530	Lewellyn Chen
531	Max Chen
532	Yasmin Fadhila Azzakiyah
533	Iffah Nabila Rahmad
534	Izzatun Nada Azzakiyah
535	Harbert Ivander
536	Sky Alexander Kwan
537	Sunshine Angelia Kwan
538	Graciella Madeline
539	Giselle Ng
540	Valencia -
541	Enzo Aldridge Teh
542	Lionel Aston Wang
543	Stacey Carina Lim
544	Jolyn Yuvina
545	Brandon Chiang
546	Adelynne
237	Madeleiene Gelwaz
255	Denzel Geraldo Wijaya
267	Darren Gerrard
268	Freya Anastasia Chendry
269	Fresia Victoria Chendry
270	Bonfilio Timothy Kosma
271	Christopher Aaron Imanuel Indrawan
280	Dylan Huang
283	Callista Abigail Suryawijaya Suryawijaya
284	Callysta Harly Huang
285	Clairine Joshanley
289	Celine Valeri Hakim
294	Katherine Argerikh Winata Winata
295	Liv Agatha Jolie
301	Chloe Zhou
307	Josh Derrick Phen
336	Jose Keiyabes Sagala
341	Matt Stanley Chua
375	Darren Gabriel
376	Elainne Callista Miracle
377	Jason Clein Halim
378	Samuel Ancillo Miracle
379	Cathelyn Basirun
381	Fiorentino Lee
391	Aurelia Caitlyn Tanujaya
418	Aristo Wiley
423	Felysse Auryn Khobert
425	Kentrick
426	Selby Cen
429	Charrelle Anthony
431	Justine Limurti
435	Alvendi Tanio
436	Braven Suryadi
437	Sheldon Suryadi
442	Beatrys Vanesa Moiras
443	Candyce Valezka Moiras
445	Sherlyn Mireil
446	Victoria Juhana
472	Stuart Tjuatja
475	Jacinda Viorenza Valentina
476	Justin Rich Limilo
477	Jovetta Kiyomi Limilo
478	Gracelyn Lawrence
479	James Brian Fan
480	Jennice
482	Reizo Kazuo Wong
483	Jolie Charlotte Huang
484	Arcelio Winston Laurence
485	Grace Ignasia Batubara
486	Nakin Ben Cuseline
487	Edward Putra Limtama
488	Khansa Tabita Sakhi
490	Shane Ferrucio Lim
493	Davian Anders
494	Arsene Eldwen
495	Celine Manuela Aritonang
497	Joyceline Fidella Aquinamora Marpaung
498	Jordan Alexander Lim
501	Jocelyn Chloe Chandra
503	Wayne Lincoln Tansley
504	Wyatt Benjamin Tansley
506	Clarabella
507	Abelvinco
508	Aldin Roi Angkasa
547	Winson Natio
548	Fiona Candiof
549	Clairine Kimberly
550	Vania Keinarra Handoko
551	Ryuichiro Leowardy
552	Brian Lim
553	Florencia Hewi
554	Brendi Lim
555	No registration
556	Lewis Darren Huang
557	Richelle Erica Luhur
558	Alysa Roberta Luhur
559	Quinetta Pearl
560	Ruiz Stythan
561	No registration
562	No registration
563	Fellicia Lawrence
564	No registration
565	No registration
566	Jollyn Felicia Wong
567	Benediva Boaz Ambarita
568	Carlista
569	Josevin Carel H.
570	Cherish Daniella Lee
571	Aurelle Sophie Kesuma
572	No registration
573	Alvaro Richie Theus
574	Brandon Tiojaya
575	Mandy Ellen Sanusi
576	Joanne Wong
577	Jovanna Wong
578	Marvel William
579	Wilbert Tanaya
580	Vivienne Zheng
581	Nicholas Zheng
582	Ethan Aldrich Lie
583	Yuvrelyn Edren Yie
584	Ivann Raphael Ohary
585	Harvey Wijaya
586	Annabella Wijaya
587	Enrico Victorian
588	Vallerent Viquel
589	Aisyah Farah Setia Ixora
590	Zadden Tanaya
591	Joyce Mirabel Ng
592	Marcelys Salim
593	Houdrick Angelico
594	Harleen Angelic
595	Kathryn Jeslyn
596	Nevaeh Ferry
597	Stuart Hayden Tay
598	Mario Aretha Ui
599	Nadya Aretha Ui
600	Gyan Lucero Joenardi
601	Mikaella Hutteleigh Ng
602	Alexandra Joan Micheline
603	Max Viandi
604	Hugo Viandi
605	Philbert Charlin
606	Stella Fredella Teoh
607	Gilbert Charlin
608	Ava Katarina Tjhe
609	Rebecca Xie
610	Josh Frederric Ang
611	No registration
612	Madelyn Chloe Wong
613	Junior Auson Halim
614	Rayden Chiang
615	Louis Anthony Shen
616	Sean Bryant Wong
617	Channelle Kimberley Wong
618	Yamin Yenardo
619	Gilbert
620	Sierra Conrad
621	Ufaira Tiandra Dalimunthe
622	Zahra Ghaniyah
623	Angelina Setyawan
624	Michael Setyawan
625	Audrey Hartono Lee
626	Alawi Ali Zumaini
627	Vin Maxwell
628	Heidi Mikaela Tenggara
629	Joey Frederica Ang
630	Nichole Gabrielle Santoso
631	Queency Joycelyn Yieginia
632	Clarisa Valencia Khomala
633	Fiona Jolys Chong
634	Glory Esther Simanjuntak
635	Hillary Kayra Orsontio
636	Zia Arafa Khairina
637	Celine Cheng
638	Chloe Olivia Ruslie
639	Bianca Olivia Ruslie
640	Amelia Laurence
641	Emily Audrie Pannata
642	Feligio Beatryan Wijaya
643	Bilson Nobleyu
644	Marson Nobleyu
645	Marsha Ava Kaylana
646	Felivia Riandy
647	Celine Hadian
648	Sarah
649	Geraldine Caitriona Saimen
650	Quintus Aurelio Tjhe
651	Ashley Claire Lorence
652	Michelle Budiman
653	Jermaine Eldwen
654	Rayden Oh
655	Euan Benson Pranoto
656	No registration
657	No registration
658	Hugh Rhys Holiverz
659	Kimberlyn Alexis Holiverz
660	No registration
661	Alexa Ellane
662	Clayton Komar Kok
663	Jacqueline Simpson
664	Chloe Valerie
665	Khoo Shu Han
666	Khoo Kwang Wei
667	Khoo Kwang Chen
668	Richelle Shiven
669	Veraldo Valentino Rusli
670	Christian Anderson Lee
671	Chloe Bernice Tan
672	Arissa Wijaya
673	Nathan Immanuel Winanto
674	Lorabelle Leon
675	Maxen Zo Leon
676	Grace Alexandra
677	Olivia Florence Loesin
678	Zoey Fiona Loesin
679	Fiorenza Eleanor Wijaya
680	Gracelyn Yap
681	Vanessa Sonata
682	Jocelyn Ryu Kaylee
683	Stanley Ace Lorence
684	Chayden Yavier Chu
685	Cherlyn Yaviera Chu
686	Owen Linwood
687	Philipp Torrien Chandra
688	Evelynn Belle Wunanda
689	Russell Ang
690	Raynard Ang
691	Vanessa Claire Wunanda
692	Alyssa Anne Wunanda
693	No registration
694	No registration
695	No registration
696	No registration
697	Ruby Lie
698	Jason Maverick Tan
699	Audrey Pheng
700	Galen Lawden
701	Louisya Nistriora Manalu
702	Rayzellvion Edren Yie
703	Stacy Kho
704	Morgan Valentino Lowis
705	Grace Vania Susanto
706	William Arthur Tjuatja
707	Samho Gunawan
708	Dixen Andersen
709	Winston Lawrence
710	Ethan Jae Ongko
711	Leon Walter Zhu
712	Ilona Freya Zhu
713	Ferguson Gohardjo
714	Delphine Adeline Bellinda
715	Ken Os Lim
716	Chloe Vallerie Jie
717	Dmitri Meddef Njo
718	Clara Glory Xie
719	Davar Aly Harahap
720	James Richley Qiu
721	Jarred Qiu
722	Enzo Witton
723	Jolin Rochelle Chen
724	No registration
725	No registration
726	Renzo Tanaka
727	Edeline Wisely
728	Venagneisa Van Grinsven
729	Carissa Aurelia Wylie
730	Felice Edly Liauwin
731	Nicole Alicia Tan
732	Edward Liu
733	Anindya Iftitah Lubis
734	Jillian Alessandra Tjhe
735	Kenward Melvern Djohan
736	Kendrick Melvern Djohan
737	Zivanna Quenby Boey
738	Adeline Njo
739	Zoefiker Putera Ngadiman
740	Aubree Lisman
741	Brayden Lisman
742	Zavelyn Marpauli
743	Nathanael Shawn Alexander
744	Vianne Renata Lim
745	Jesslyn
746	Jocelyn Leman
747	Jacklyn Feliska Hasan
748	No registration
749	Jocelyn M Yasmine Parhusip
750	No registration
751	Howie Chan
752	No registration
753	Eugene Matthew
754	Reagan Khei Subroto
755	Sherly
756	Callista Sumono
757	Jeanice Madeleine Kwok
758	Sofia Lukman
759	Warren Emanuel
760	Richard Zheng
761	Richelle Zheng
762	Hogan Calixto Huang
763	Safira Reynia Hanum
764	No registration
765	No registration
766	Frincelia Wijaya
767	Theodore Joachim Wihardjo
768	Josh Seravino Zhang
769	Joyce Yang
770	Emma Gozali
771	Jileen Chen
772	Joleen Chen
773	No registration
774	No registration
775	Clarissa Amberlyn
776	Eason Niklaus
777	Audrey Victoria Lim
778	Christian Beryl Sinuhaji
779	Jayden Tarmidi
780	Steven Nicholas Halim
781	Savannah Zoe Wijaya
782	Hana Sophia Alice
783	Evelynn Lee
784	Garrix Ardent Putra
785	Kelly Alyse Tanary
786	Shelline Sutanto
787	Shahnaz Shirendia
788	Mhd Farid Athallah Hasibuan
789	James T Chandra
790	Hardey Moeldoko Law
791	Eduardo Xaviero Bingei
792	Hubert Bryan
793	Grace Kelly
794	Judyth Annabelle Naulibasa
795	Avelynn Wijaya
796	Ashton Howie
797	No registration
798	No registration
799	Meredith Adlian
800	Xavier Orlando Boe
801	Hillary Calista Tamado Panjaitan
802	Arthur Kendrick Zhuang
803	Lovea Fendy Kho
804	Rebecca Iewanto Xu
805	Jevan Sean Vertio
806	Efrata Iskandar Liunardi
807	Tristan Jacob
808	Gareth Brilliant Lim
809	Emilia Niko Nyoman
810	Jayden Tanadin
811	Arthur Floyd Salim
812	Lorenzo Margo Jap
813	Kimmy Tjanaka
814	Navarro Lim
815	Alicia Oranie Depari
816	Victoria Alberta Zheng
817	Nicho Chandra Vimalanetra
818	Naomi Alexis Supangat
819	Maria Jill Lumbantoruan
820	Alexander Alberta Zheng
821	Vallerio
822	Clarissa Olivia Anne Lammora Panjaitan
823	James Bryan Tantono
824	Septiana Katelyn Sharon Sinaga
825	Grace Elizabeth
826	Darren Wilson
827	Aldrich Reynard Atmadi
828	Elvano Reynard Atmadi
829	Zhafir Gantari
830	Justin Junior
831	Ryan Hugo Purnomo
832	Allessandra J Lee
833	Quin Adrianna
834	Mario Charlie
835	Finn Aldrich Luman
836	Kent Arthur Luman
837	Clairine Angela Indrajaya
838	Louis Harvey Soesanto
839	Caitlyn Bianca Tjiaman
840	Cullen Brian Tjiaman
841	Jocelyn Jolie Tainiady
842	Ethan Moeritz
843	Jenessa Effendy
844	Callista Stacy Lim
845	Wallace Evencio
846	Stevaldo Verino Oursun
847	Claudia Catherine
848	Ethan Fernandez Yap
849	Wilbert Limin
850	Karin Destynsia
851	Tiffany Taniwan
852	Cellistia Cangdiago
853	No registration
854	Chiara Vallerie Jie
855	Cayden Louis Auwrich
856	Carissa Catherine
857	Hogan Chan
858	Delmond Osyan Sudilan
859	Clarissa Kho
860	Michelle Yap
861	Cyndi Ramaly
862	Calvin Ramaly
863	Bonita Gaudeti Sinaga
864	No registration
865	Victoria Yap
866	Carlsen Simen
867	Cherlyn Simen
868	Sergio Garcia Ang
869	Fleurette Celestine Lee
870	Karen Hazel Liu
871	Ryant Anthoney Lim
872	Kenneth Samuel Lim
873	Ozil Ramadhan Hutasuhut
874	Muhammad Rafli Arkan
875	Clarissa Fredelyn Jeoh
876	Jacqueline Vallerie Chen
877	Jenica Zealand Feng
878	Bianca Maldiva Feng
879	Jolin Vander Cia
880	Joel Edward
881	No registration
882	Justin Chen
883	Joanne Lynch
884	Starley Valero Gozali
885	Skylar Valdesto Gozali
886	Jazzlyn Javeni
887	Filia Cielo Lim
888	Celine Chastine Angkasa
889	Madelyn Odelia Lowis
890	Eunice Grace
891	Jayxvier Keegan Chuwardi
892	Edward Nursalim
893	Prajna Nursalim
894	Sudatta Nursalim
895	Michelle Angelina Yip
896	Nicolas Carlie Kuwira
897	Valerie Ivana Chen
898	Ricson Stanlay
899	Jay Ven
900	Nicole Carmen Chang
901	Elaine Velicia
902	Malcolm
903	Harvey Oliver Lee
904	Callista Aurelia Tasma
905	Carissa Aurelia Tasma
906	Dario Oscar Zhong
907	Emma Valerie Pang
908	Averynn Marcia Pang
909	Keona Jaileynn Lawrence
910	Michael Thamida
911	Meivellynn Thamida
912	Alfred Benyamin Leidin
913	Roselie Kirana Wijaya
914	Leia Kaytlyn Tioe
915	Rachel Darlyn Udjaja
916	Valentino Nauli Basa
917	Harlex Tjengdekia
918	Fayee Abqaira Putrigian Sinambela
919	No registration
920	No registration
921	No registration
922	Victoria Cenata
923	No registration
924	Ethan Elka Suyento
925	Quinn Felicia Foo
926	Arthur Ignatius Carrari
927	Richela Stanlay
928	Victoria Roesli
929	Trevor Hartono Lee
930	Celine Nichola Xie
931	Zealand Charvi Nathang
932	Olivia Tjoa
933	Ivy Jeane Chanella
934	Zac Anthony Chua
935	Gisella Nyoto
936	No registration
937	Jillian Claire Kuanrius
938	Reagan Nyoto
939	Rexcaden Jazper Shu
940	No registration
941	No registration
942	Elaine Viandi
943	No registration
944	Kent Aldrich Huang
945	Angeline Felice Theo
946	Ryufin Junus
947	Nayyara Ayaskara Prakasita
948	Erick Winner Teo
949	Amelia Irawan
950	Audrey Madison Loewe
951	Mavin Jericho Phen
952	Louis Alvaro Wang
953	Chloe Valencia Wang
954	Ammiel Malikha Lamria
955	Naomi Grace Edward
956	Aileen Sophie Kesuma
957	Rafifa Aisha Mahira
958	Raisya Putri Raharjo
959	Aleyna Chandra
960	No registration
961	No registration
962	Ananda Putera Ngadiman
963	Yasmina Athirah Rifqi
964	Yazeed Abizar Rifqi
965	Modric Agusta Daruma
966	No registration
967	No registration
968	Lady Valery Sinambela
969	Jordan Keegan
970	Annabela Himeko Winarta
971	No registration
972	Darren Javier Wu
973	No registration
974	No registration
975	No registration
976	No registration
977	Micha Belle Tan
978	Clara Jill Valerie
979	No registration
980	Ezio Lim
981	Joey Milan Phen
982	Abigail Hazel Tamin
983	Jashton Tokyo
984	Chaden Ettienne Halim
985	No registration
986	Jason Allen Tjoa
987	Caren Pandiago
988	Gavyn Wijaya
989	Federico Fredelyn Jeoh
990	Zason Riady Ko
991	Arya Kho
992	James Ananda Wijaya
993	Miranda Belle Tan
994	Valisha Sofi Tjandra
995	Qori Putri Syahviah
996	Venesia Anggini Purba
997	Jovin Limcoln
998	Fedrick Wijaya
999	Annabelle Grace Wu
1000	Chloe Sinjaya
1001	Hanson Nicolas Chandra
1002	Hubert Ulrich Tan
1003	Arthur Alexander Hakim
1004	Vederrick Ethan Jap
1005	Gisella
1006	Jerico
1007	Davina Grace Ong
1008	Sydney Princessa Lim
1009	Felicia Grace Ong
1010	Gracielle Grace Ong
1011	Clarence
1012	Clarence Aurelia Colim
1013	Michelle Kalyani
1014	Catherine Gotami
1015	Fransisca
1016	No registration
1017	Harvardo Lovenzo Susanto
1018	Freddy Salim
1019	Louis Clinton Chai
1020	Caren Axella Natania Lumbantoruan
1021	No registration
1022	Efraim Lucas Dimitri
1023	Darryl Raynold Leowe
1024	Chloe Audrey Chen
1025	Hermione Lovely Susanto
1026	Angelina Novita Chandra
1027	Elnino Jehanra Saragih
1028	Darren Winston
1029	Luna Antoinette Linne
1030	Valerie Rosalyn Yap
1031	Jacques Lewinsky
1032	Joey Celine
1033	Shelvina Howie
1034	Cherryl Riquelme Potan
1035	Adeline Luhur
1036	Verencia Alden
1037	Caitlyn Allison Yaphen
1038	Devon Jau
1039	Naafa Maisyva Ginting
1040	Shane Anastasya Kristy Simangunsong
1041	Chloe Taydey
1042	Maydelyn Zhang
1043	Kenrich Thantio Yangderson
1044	Dominic Kie
1045	Silvario Soedidjo
1046	Max Wayne Subroto
1047	Jordan Tanutama
1048	Reynard Lis
1049	Rafael Maximillian Sitorus
1050	Galang Roland Besch
1051	Timothy Anwi Panca
1052	Carlene Yang
1053	Elaine Clemence Annabell
1054	Renata Allie Rusli
1055	Reginald Ali Rusli
1056	Yeslin Yap
1057	Louis Xavier Leonardi
1058	Gracia Tiffany Susanto
1059	Meuthia Gadiza
1060	Zac Aldrich Mayor
1061	Kayden Skylar Sanso
1062	Queensya Lovely Reya
1063	Nicole Beh
1064	Morgan Beh
1065	Maxwell Louis Jaya
1066	Samuel Christopher Halim
1067	Richester Casvio Liong
1068	Hiero Haydenzo Huang
1069	Kartrine Sathya Felim
1070	Krishna Dhammo Felim
1071	Chloe Aurelia Ten
1072	Hazel Natalie Ten
1073	Scarlett Avery Ten
1074	Ayska Najya Prakasita
1075	Bryan Michael Ng
1076	Brayden Matthew Ng
1077	Alqueenza Syifa Winona
1078	Ethan Kenny Daruma
1079	Keigo Kusuno Soh
1080	Reynara Amber Koiman
1081	Carlton Kho
1082	Davin Obert Khoo
1083	Gillian Alexa Pearl
1084	Leonard Nyoto
1085	Garent Nyoto
1086	Kayden Ethan Zhou
1087	Nicole Eunice Lautan
1088	Alesha Sofia Andhika
1089	Jessica Jo
1090	Healey Tjoe
1091	Jennifer Othniella Situmorang
1092	Jill Madison Ali
1093	Annastasia Hideko Winarta
1094	Howard Richer Thia
1095	Regina Fortuna Amal
1096	Maxwell Kenson Wibisono
1097	Reia Rose Winfield
1098	Naia Sydney Winfield
1099	Cleva Levica
1100	Khansa Salsabila
1101	Fredella Alexa Maranggi Siregar
1102	Adhyasta William Nugroho
1103	Nicholas Tjin
1104	Abbygael Mikaela Tangelyn
1105	Keiko Aiby Lim
1106	Vierra Cleevany Ryu
1107	Gwyneth Louisa Yap
1108	Zea Alesha Rizki
1109	Princess Latheefa Azzura
1110	Aaron Yang
1111	Howie Leonard Wijaya
1112	Maynard Jeremiah Simarmata
1113	Joe Benedict Japto
1114	James Tjoa
1115	Reagan Oliver Zhuang
1116	Kim Megumi
1117	Claire Gabrielle Oscar
1118	Reagan Thierry Wijaya
1119	Andrea Dimitri Ashraafi Lazzaroni
1120	Reynand Wijaya
1121	Liam John Rickson
1122	Leeanne Jane Lim
1123	Joequinn Felysse Warsono
1124	Felicia Liangso
1125	Grace Anastasia Zeng
1126	Yedidyah Mikaela Erina
1127	Edric Luiz Ongka
1128	Lashira Awbinsriee Pane
1129	Stephanie Evelyn Luo
1130	Ethan Ray Maxwell
1131	Vinxiero Carrick Francoiz
1132	Nicole Lee
1133	Natalie Willeen Zhang
1134	Kent Nanda Daruma
1135	Cherysse Auryn Khobert
1136	Ernesto Zedden Wirawan
1137	Celine Angeline Yiandri
1138	Mike Louis Wijaya
1139	Wilbert Wijaya
1140	Keita Raelyn Deng
1141	Joyce Nathania Shen
1142	Oscar Linwood
1143	Rico Alvaro Chandra
1144	Kayla Shilyn Gani
1145	Gallen Yuman King
1146	Charis Yafa Tobing
1147	Calista Kasih Aprilia Harahap
1148	Talysha Sri Nayla
1149	Arnold Alexander Hakim
1150	Kellyn Chandra
1151	Theona Zefanya Purba
1152	Javerson Joshua Tobing
1153	Philippe Benedict Zhuang
1154	Aca Raymond Tjemerlang
1155	Howard Winston Louis
1156	Alika Zelmira Wibowo
1157	Gywen Stefanie Wiley
1158	Kendrick Eoghan
1159	Kezia Zenitha Sinaga
1160	Karen Kallenia Sinaga
1161	Randa Miracle Boasly Sihombing
1162	Carine Susanto Lie
1163	Azarine Apriza Darmawan
1164	Felicia Ivana Silalahi
1165	Madeline Lauren
1166	Anderson Putra Supama
1167	Fredericka Sigalingging
1168	Viorencia Tantana
1169	Gisellene Lowisuri
1170	Kaylynn Zhanghoven
1171	Angelina Cenata
1172	Ferdian Zulkarnain
1173	Mia Emily Soeripin
1174	Vivienne Claire Soeripin
1175	Vingeline Chelsealya Angkasa
1176	Jean Catherine Anneliese Sebayang
1177	James Edward Lie
1178	Richeline Huang
1179	Livi Celia Lim
1180	Hariwell
1181	Azzam Al Vanka
1182	Stella Wijaya
1183	Maxwell Utomo
1184	Louis Sinclair Zuary
1185	Genovia Grace Widjaja
1186	Ray Yudhistira Ng
1187	Michelle Aurelia Chen
1188	James Oliver Coaca
1189	Kennan Eito Shankara
1190	Nalina Vimala
1191	Joya Vania Silaen
1192	Sergio Ronald Utomo
1193	Cheryl Eilyn Affandy
1194	Max Kingston Marzuki
1195	Kenzo Wibowo Marzuki
1196	Grace Martok
1197	Adzkiya Kyona Mahendra
1198	Jovan Jonathan Cen
1199	Joey Jonas Cen
1200	Jayden Darren Wijaya
1201	Ivania Gracesinka
1202	Cornelius Wilfred
1203	Kevin Fico Aurelio
1204	Kendrick Filbert Aurelio
1205	Kaylee Alessia Ridgen
1206	Daniel Haryanto
1207	James Jayden Chandra
1208	Dwayne Alvaro Phen
1209	Michele Cecilia Belvania Saragih
1210	Joycelyn Annabelle
1211	Dion Lorenzo Castio
1212	Aurelia Wyanto
1213	Kaylee Wayne Laong
1214	Fiona Tjongnata
1215	Julfini Chu
1216	Marc Maximus Zhang
1217	Daxton Lie
1218	Odilia Alexandra Yang
1219	Naviauly Dolorosa Sinaga
1220	Kinara Caliezia Pangestu
1221	Cika Linatasia Tampubolon
1222	Hans Andersen Yap
1223	Steve Marcellino
1224	Collins Anderson
1225	Winnie Lorenz Tjialin
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
70100001	Katrisha Davinia Lim
70100002	Matthew Yeo
70100003	Cherisse Wong Jono
70100004	Maryam Shareen Anandifa
70100005	Lyvia Verlynn
70100006	Jason Hartono Huang
70100007	Jevany
70100008	Clarissa Ruthana Sipayung
70100009	No registration
70100010	Nicole Rikki
70100011	No registration
70100012	No registration
70100013	No registration
70100014	Desmond Dinata Ong
70100015	Judyth Annabelle Naulibasa 
70100016	Dwayne Jzekiel Angsana
70100017	No registration
70100018	No registration
70100019	Andrea Tabitha Florencia Simatupang
70100020	Diandra Ezra Nauli Simatupang
70100021	Rafael Daniello Tamba
70100022	Josandy
70100023	Evonne Gwen Lim
70100024	No registration
70100025	No registration
70100026	No registration
70100027	Daniel Goh
70100028	Elaine Gwen Lim
70100029	No registration
70100030	No registration
70100031	Rahardian Ozil S
70100032	No registration
70100033	No registration
70100034	Muazzam Khalifi Adera
70100035	Fasya Putradinata Syam
70100036	Gilbert Faustin Wijaya
70100037	Abigail Rhea Lim
70100038	Richard Alexi Pratama
70100039	Gwen Valerie
70100040	Mario Dominic Warouw
70100041	Raisha Adila Gunawan
70100042	Jessica Sharon
70100043	Enrico Felix Daniel Siagian
70100044	Amelia Natasha Siagian
70100045	No registration
70100046	Kirania Inara Azalea
70100047	Keyzia Faiana Daulay
70100048	Moreno De Truman
70100049	Eillen Faustine Wijaya
70100050	Ellys Faustine Wijaya
70100051	Enzo Howell
70100052	Darrel Hizkia Tambunan
70100053	Ghassan Ghazali Ginting
70100054	Olivia Nooman
70100055	Clarissa Kimberly Luvalencia
70100056	Jason Louis
70100057	Evelyn Frelda Gurning
70100058	Anya Pehulisa Ginting
70100059	Rebecca Florencia Siregar
70100060	Lincoln Blaine
70100061	Colleen Blaine
70100062	Nichole Hasan
70100063	Calysta Celorine Bakara
70100064	Rachel Nathania Situmorang
70100065	No registration
70100066	No registration
70100067	No registration
70100068	Radinka Agra Sitepu
70100069	Al Namira Safitri Saragih
70100070	Keysha Kania Ramaditya
70100071	Muhammad Al Khawarizmi Fairel
70100072	No registration
70100073	Tristan Arsenio
70100074	Darnell Samahea Lakhomi Laia
70100075	Maro Louis Dear Purba
70100076	Marwa Alya Sakinah Rangkuti
70100077	Aldiana Masha Lovelia Br Sembiring
70100078	Sakina Alima Regune Harahap
70100079	Almira Izanti Kamilah Daulay
70100080	Dewi Syaahira Sabina Siregar
70100081	Carmen Tjokromitro
70100082	Careen Tjokromitro
70100083	Breanna Octovindo
70100084	No registration
70100085	No registration
70100086	Maria Graciana Chica Purba
70100087	Micella Alexa Pinem
70100088	Mikhayla Tabita Pinem
70100089	Aurelia Intan Leung
70100090	Annisa Letizia Shanum
70100091	No registration
70100092	No registration
70100093	No registration
70100094	No registration
70100095	No registration
70100096	No registration
70100097	No registration
70100098	Erland Sohilida Laia
70100099	No registration
70100100	No registration
70100101	No registration
70100102	Bryan Taslim
70100103	No registration
70100104	No registration
70100105	No registration
70100106	Dareen Davinci Ginting
70100107	No registration
70100108	No registration
70100109	Kania Ghassani Setiawan
70100110	Filbert Wandrew
70100111	Keshia Nakia Hayfa Azka
70100112	Fathi Arkan Wiyatmika
70100113	Jiselle Hartanto
70100114	Frederika Lovenberg Siahaan
70100115	Candice Alicia Wai
70100116	Rayyan Putra Raharjo
70100117	Akhdan Arief Athaya
70100118	Cladys Nadine Frietania
70100119	Chew Zi Yang
70100120	Aishaqillah Syifatin Mahirah Kurniawan
70100121	Shane Anthony Jawson
70100122	Shadrina Azheema Lubis
70100123	Shafiqa Adeeva Lubis
70100124	Mikayla Aqueena Shaquilla
70100125	Moni Laprincia Br Ginting
70100126	Berliando Lovely Sihombing
70100127	Gabriel Ihut Martuaro Sihombing
70100128	Syia Kim
70100129	Alliya Ellduci Dermawan
70100130	Muhammad Rafa Al Siena
70100131	Clairine Bellvania Gavrila Ginting
70100132	Devin Suhendra 
70100133	Lionel Maverick 
70100134	Diandra Santika
70100135	Adib Nufal Wibowo
70100136	Syakirah Khairani Jamilah
70100137	Frederika Lovenberg Siahaan
70100138	Maura Shaqifa Rubyna
70100139	Daniella Demeintieva
70100140	Gabriella Theofanny Putri Meliala
70100141	Aqeela Shafa Batrisya
70100142	Shane Nathantaras Tarigan
70100143	Kaleb Edgar Goel Hasugian
70100144	Faqih Fadhilah Wijaya
70100145	Hafiqa Raikhsa Karo Karo
70100146	Alexa Brianna Tambunan
70100147	Faza Kiyana Azdah
70100148	Davina Elisha Ginting
70100149	Jaeson Nathan Yap
70100150	Nadhira Calista Purba
70100151	Fakhira Idris Harahap
70100152	Abigail Carissa 
70100153	Dareen Azel Matthew Sembiring
70100154	Ashera Natama Sitorus
70100155	Stella Aprilia Sianipar 
70100156	Tengku Muhammad Malik Al Fatih
70100157	Faqhan Asshadiq Winata
70100158	Gracelyn Patricia
70100159	Nadia Fathaniah Chandra
70100160	Jordan Noel Yap
70100161	Khezya Queen Zareen Br Panggabean 
70100162	Arya Satya
70100163	No registration
70100164	No registration
70100165	Ghazia Raesha Afthani Lubis
70100166	Farrin Rafania Shezan Lubis
70100167	Arsa Clianta Saragih
70100168	Mora Leticia Sinaga
70100169	Warren Leander Wichael
70100170	No registration
70100171	No registration
70100172	No registration
70100173	Muhammad Naufal Athariz Ritonga
70100174	Jerrick Onggoro Hakim
70100175	Ondo Vico Fidelis Giant Sitohang 
70100176	Muhammad Asyam Haris Tanjung 
70100177	Raphael Evan Hiro Ompusunggu
70100178	No registration
70100179	Doria Marchisia Giussevine Saragih
70100180	Jevano Septarey Saragih
70100181	No registration
70100182	No registration
70100183	No registration
70100184	Atha Malik Chairmawan
70100185	Alice Nathalie Brigitta
70100186	Alvaro Gavriel Batara Sihotang
70100187	Graccyella Martgehaan
70100188	Latisya Naya Alamsyah Nasution
70100189	Lashira Naifa Alamsyah Nasution
70100190	Arta Glory Hutasoit
70100191	Yosihana Hutasoit
70100192	Kania Laviza Andhini
70100193	Nadhira Ayria Verdian
70100194	Danella Christabel Hasean Saragih
70100195	Marisca Agustina Br Surbakti
70100196	Abdullah Syafa Assyunni Rangkuti
70100197	Keira Agatha Dameria Resubun
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
90100001	Rowan Maverick Ang
90100002	Giselle Liandy
90100003	Ivy Jeane Chanella
90100004	Jeovenna Cangie
90100005	Felynn Holy Richson
90100006	Kenzie Rowland Huangdinata
90100007	Carrick Classico
90100008	Michelle Teochan
90100009	Marchelline Teochan
90100010	Chloe Marjorie Wen
90100011	Chloe Quisha Anggara
90100012	Emily Santo
90100013	Candice Julian Sakiwa
90100014	Claire Adelynn Wu
90100015	Clarissa Felicia Chandra
90100016	Rodrigo Lorenzo
90100017	Clarabelle Louisa
90100018	No registration
90100019	No registration
90100020	Winston Hubert
90100021	Aidan Benjamin Yapar
90100022	Jeanice Wu
90100023	Brooklyn Svenrich Ang
90100024	Welceline Charissa Tsjin
90100025	Celine Devina Guo
90100026	Winston Guo
90100027	No registration
90100028	Haylee Weng
90100029	No registration
90100030	No registration
90100031	Marvel Chan Rachmat
90100032	Rohan Chan Rachmat
90100033	Matthew Dunston Halim 
90100034	Quinsha Charlyn Ow
90100035	Carlen Edeline Br. Keliat
90100036	Carlos Ferdinand Putra
90100037	No registration
90100038	No registration
90100039	Reynard Alderich Guntur
90100040	No registration
90100041	Philips
90100042	Justin Nawi
90100043	Valentino Owen Liu
90100044	Velove Alexa Winstan
90100045	David Howard
90100046	Hugo Maximus Ling
90100047	Bryant Maximus Ling
90100048	No registration
90100049	Harvey Susanto
90100050	No registration
90100051	Valerie Legolas Cen
90100052	No registration
90100053	No registration
90100054	No registration
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
90100255	Felicia Fransisca`;

async function syncTraineeIdsFast() {
  try {
    console.log('Parsing master ID and Name mapping...');
    const lines = rawInput.split(/\r?\n/).filter(l => l.trim());
    const validPairs = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split('\t').map(c => c.trim());
      const id = cols[0];
      const name = cols[1];

      if (!id || !name || name.toLowerCase() === 'no registration' || name === '-') continue;

      validPairs.push({ id, name });
    }

    console.log(`Loaded ${validPairs.length} valid ID-Name mapping pairs!`);

    // Prepare temp table / bulk update
    await db.query(`CREATE TEMP TABLE temp_id_map (id_val VARCHAR(100), name_val VARCHAR(255));`);
    
    // Chunk insert into temp_id_map
    const chunkSize = 200;
    for (let i = 0; i < validPairs.length; i += chunkSize) {
      const chunk = validPairs.slice(i, i + chunkSize);
      const valStrings = [];
      const params = [];
      
      chunk.forEach((p, idx) => {
        params.push(p.id, p.name);
        valStrings.push(`($${params.length - 1}, $${params.length})`);
      });

      await db.query(`INSERT INTO temp_id_map (id_val, name_val) VALUES ${valStrings.join(', ')}`, params);
    }

    console.log('Inserted pairs into temp_id_map. Executing bulk UPDATE on portal_admin...');

    const updateRes = await db.query(`
      UPDATE portal_admin p
      SET trainee_id = t.id_val,
          raw_data = jsonb_set(COALESCE(p.raw_data, '{}'::jsonb), '{trainee_id}', to_jsonb(t.id_val::text)),
          updated_at = NOW()
      FROM temp_id_map t
      WHERE LOWER(TRIM(p.name)) = LOWER(TRIM(t.name_val));
    `);

    console.log(`Successfully updated ${updateRes.rowCount} rows in portal_admin!`);

    const sample = await db.query(`SELECT trainee_id, name, class_name, branch FROM portal_admin WHERE trainee_id IS NOT NULL ORDER BY trainee_id ASC LIMIT 5;`);
    console.log('Sample updated rows:', sample.rows);

  } catch (err) {
    console.error('Error syncing trainee IDs:', err);
  } finally {
    process.exit(0);
  }
}

syncTraineeIdsFast();

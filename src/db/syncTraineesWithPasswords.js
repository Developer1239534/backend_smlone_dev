const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./neonClient');

// Raw text pasted by the user containing ID, Name, and specific smlone- password
const rawText = `
1003	Arthur Alexander Hakim	smlone-ZugJu
1007	Davina Grace Ong	smlone-KiPAa
1008	Sydney Princessa Lim	smlone-juxFX
1009	Felicia Grace Ong	smlone-qPqi1
1010	Gracielle Grace Ong	smlone-dPf1c
1012	Clarence Aurelia Colim	smlone-qOS1R
1015	Fransisca	smlone-KjckO
1017	Harvardo Lovenzo Susanto	smlone-MGsmX
1019	Louis Clinton Chai	smlone-2eUtw
1020	Caren Axella Natania Lumbantor	smlone-NGDRz
1022	Efraim Lucas Dimitri	smlone-eFKVN
1023	Darryl Raynold Leowe	smlone-OJPhx
1024	Chloe Audrey Chen	smlone-atfDl
1025	Hermione Lovely Susanto	smlone-IShlJ
1027	Elnino Jehanra Saragih	smlone-ihmup
1028	Darren Winston	smlone-O8qk7
1029	Luna Antoinette Linne	smlone-0vhfn
1030	Valerie Rosalyn Yap	smlone-ddefz
1031	Jacques Lewinsky	smlone-NhfDb
1033	Shelvina Howie	smlone-t2lpi
1034	Cherryl Riquelme Potan	smlone-lPIIL
1037	Caitlyn Allison Yaphen	smlone-24ajx
1038	Devon Jau	smlone-7xOWX
1039	Naafa Maisyva Ginting	smlone-A8AJg
1040	Shane Anastasya Kristy Simangu	smlone-IVBxm
1041	Chloe Taydey	smlone-NK184
1043	Kenrich Thantio Yangderson	smlone-vALGy
1044	Dominic Kie	smlone-6GUJK
1045	Silvario Soedidjo	smlone-CWifh
1047	Jordan Tanutama	smlone-01VOl
1049	Rafael Maximillian Sitorus	smlone-DnFvq
1050	Galang Roland Besch	smlone-bdvuB
1051	Timothy Anwi Panca	smlone-kn5iL
1053	Elaine Clemence Annabell	smlone-6mDO3
1056	Yeslin Yap	smlone-7oBKh
1057	Louis Xavier Leonardi	smlone-AtYFV
1058	Gracia Tiffany Susanto	smlone-RpOpi
1059	Meuthia Gadiza	smlone-3vVTI
1060	Zac Aldrich Mayor	smlone-9HEMT
1061	Kayden Skylar Sanso	smlone-B1mul
1062	Queensya Lovely Reya	smlone-dQ8Xa
1065	Maxwell Louis Jaya	smlone-Q6vev
1066	Samuel Christopher Halim	smlone-Qirr6
1067	Richester Casvio Liong	smlone-x6YfT
1071	Chloe Aurelia Ten	smlone-uEGqg
1072	Hazel Natalie Ten	smlone-K9pmA
1073	Scarlett Avery Ten	smlone-mFz2R
1074	Ayska Najya Prakasita	smlone-DoyzL
1075	Bryan Michael Ng	smlone-USYhT
1076	Brayden Matthew Ng	smlone-ocfTd
1077	Alqueenza Syifa Winona	smlone-23DfS
1078	Ethan Kenny Daruma	smlone-C0Ac3
1079	Keigo Kusuno Soh	smlone-oomXO
1080	Reynara Amber Koiman	smlone-opjdT
1081	Carlton Kho	smlone-N33Up
1083	Gillian Alexa Pearl	smlone-VWool
1084	Leonard Nyoto	smlone-FTJOa
1085	Garent Nyoto	smlone-ru3Eh
1086	Kayden Ethan Zhou	smlone-sE620
1088	Alesha Sofia Andhika	smlone-OYNdn
1089	Jessica Jo	smlone-0ELDL
1090	Healey Tjoe	smlone-Hx8ur
1093	Annastasia Hideko Winarta	smlone-TsF35
1096	Maxwell Kenson Wibisono	smlone-rFzEL
1097	Reia Rose Winfield	smlone-7ztZs
1098	Naia Sydney Winfield	smlone-ocwRS
1101	Fredella Alexa Maranggi Sirega	smlone-IGpcK
1102	Adhyasta William Nugroho	smlone-RbeEy
1103	Nicholas Tjin	smlone-SZyZs
1104	Abbygael Mikaela Tangelyn	smlone-2YiPw
1105	Keiko Aiby Lim	smlone-UOX4G
1106	Vierra Cleevany Ryu	smlone-Gh7M0
1111	Howie Leonard Wijaya	smlone-1WSkq
1113	Joe Benedict Japto	smlone-8krzl
1114	James Tjoa	smlone-CHT1b
1115	Reagan Oliver Zhuang	smlone-9CJu6
1116	Kim Megumi	smlone-oBo6L
1117	Claire Gabrielle Oscar	smlone-Ofd6Z
1119	Andrea Dimitri Ashraafi Lazzar	smlone-08xo2
1120	Reynand Wijaya	smlone-YOtyF
1121	Liam John Rickson	smlone-kI1IF
1122	Leeanne Jane Lim	smlone-v6PHg
1123	Joequinn Felysse Warsono	smlone-Ujx24
1124	Felicia Liangso	smlone-nouPE
1125	Grace Anastasia Zeng	smlone-rJfdo
1127	Edric Luiz Ongka	smlone-0fbLf
1128	Lashira Awbinsriee Pane	smlone-1MvYN
1129	Stephanie Evelyn Luo	smlone-iM58s
1130	Ethan Ray Maxwell	smlone-TGrlJ
1131	Vinxiero Carrick Francoiz	smlone-0xuyH
1132	Nicole Lee	smlone-uw10c
1133	Natalie Willeen Zhang	smlone-ETVke
1134	Kent Nanda Daruma	smlone-C29xW
1135	Cherysse Auryn Khobert	smlone-34Ful
1137	Celine Angeline Yiandri	smlone-9CRM2
1138	Mike Louis Wijaya	smlone-n0BeU
1139	Wilbert Wijaya	smlone-jBi4Y
1140	Keita Raelyn Deng	smlone-G86YN
1141	Joyce Nathania Shen	smlone-3NBrw
1142	Oscar Linwood	smlone-TkCB2
1143	Rico Alvaro Chandra	smlone-i6Fy8
1144	Kayla Shilyn Gani	smlone-vyFuF
1145	Gallen Yuman King	smlone-kJ4zw
1146	Charis Yafa Tobing	smlone-a8rie
1147	Calista Kasih Aprilia Harahap	smlone-V3a3p
1148	Talysha Sri Nayla	smlone-QSpjF
1149	Arnold Alexander Hakim	smlone-aoDq1
1150	Kellyn Chandra	smlone-OlqNg
1151	Theona Zefanya Purba	smlone-neiQP
1152	Javerson Joshua Tobing	smlone-JZidA
1153	Philippe Benedict Zhuang	smlone-6w8PO
1154	Aca Raymond Tjemerlang	smlone-TWXWD
1155	Howard Winston Louis	smlone-J4zLY
1161	Randa Miracle Boasly Sihombing	smlone-VfK2k
1164	Felicia Ivana Silalahi	smlone-aqwru
125	Jayxen Maxwell	smlone-bZxLk
141	Russell William Tanner	smlone-EjgHg
149	Elaine Velicia	smlone-ZEVAk
249	Emily Santo	smlone-ZQze2
255	Denzel Geraldo Wijaya	smlone-oBHGx
269	Fresia Victoria Chendry	smlone-NBH0H
27	Valerie Legolas Cen	smlone-aJNLF
274	Candice Winardi Wong	smlone-6ppjl
285	Clairine Joshanley	smlone-J82r3
301	Chloe Zhou	smlone-KyiWy
329	Vrederick Benaricco Tanjaya	smlone-THC7m
333	Jasmine Yenarti	smlone-SI48J
368	Felice Vallerie Angkasa	smlone-E7M2R
375	Darren Gabriel	smlone-uaGQY
429	Charrelle Anthony	smlone-9frVQ
440	Sofia Grace Wu	smlone-1dELo
442	Beatrys Vanesa Moiras	smlone-aNheR
443	Candyce Valezka Moiras	smlone-WG84s
45	Aaron Goldwin Semarak	smlone-TWbga
48	Justin Maxwell	smlone-yc5sN
482	Reizo Kazuo Wong	smlone-DdWXe
483	Jolie Huang	smlone-NHzDE
49	Richmond Osyan Sudilan	smlone-NoRiz
490	Shane Ferrucio Lim	smlone-INpte
50	Kenichi Zhou	smlone-DCg8H
51	Cedric Yago	smlone-33RYD
528	Kiery Keionna Kie	smlone-3GBzO
531	Max Chen	smlone-LT1po
532	Yasmin Fadhila Azzakiyah	smlone-gzAYZ
545	Brandon Chiang	smlone-OdHlp
548	Fiona Candiof	smlone-pMXyp
553	Florencia Hewi	smlone-kATSC
566	Jollyn Felicia Wong	smlone-IGmYr
569	Josevin Carel H.	smlone-FcFTC
574	Brandon Tiojaya	smlone-hQCSE
575	Mandy Ellen Sanusi	smlone-3te62
580	Vivienne Zheng	smlone-Kz8pd
581	Nicholas Zheng	smlone-uqkM2
582	Ethan Aldrich Lie	smlone-E1o8T
585	Harvey Wijaya	smlone-dH3PD
586	Annabella Wijaya	smlone-cNJn8
587	Enrico Victorian	smlone-ZwsVr
60	Sharleen Velicia Lim	smlone-nBtUC
601	Mikaella Hutteleigh Ng	smlone-N4WxD
602	Alexandra Joan Micheline	smlone-gDTZn
604	Hugo Viandi	smlone-MtyHp
613	Junior Auson Halim	smlone-V4RTX
614	Rayden Chiang	smlone-3uZJt
618	Yamin Yenardo	smlone-oUpui
621	Ufaira Tiandra Dalimunthe	smlone-eYCJu
625	Audrey Hartono Lee	smlone-bH0Bz
629	Joey Frederica Ang	smlone-688Z0
631	Queency Joycelyn Yieginia	smlone-8qqN4
633	Fiona Jolys Chong	smlone-QsszX
636	Zia Arafa Khairina	smlone-aEzH2
638	Chloe Olivia Ruslie	smlone-Ep5FM
639	Bianca Olivia Ruslie	smlone-JGxnu
64	Jillian Rusly	smlone-FHx0d
651	Ashley Claire Lorence	smlone-msmGj
654	Rayden Oh	smlone-w56wg
665	Khoo Shu Han	smlone-e4y7r
670	Christian Anderson Lee	smlone-Mziva
673	Nathan Immanuel Winanto	smlone-Ez6KG
675	Maxen Zo Leon	smlone-8eYXF
676	Grace Alexandra	smlone-uYWy5
679	Fiorenza Eleanor Wijaya	smlone-XMjfe
680	Gracelyn Yap	smlone-OAHJt
683	Stanley Ace Lorence	smlone-lcO3c
686	Owen Linwood	smlone-C5vQK
70100004	Maryam Shareen Anandifa	smlone-AeO3A
70100005	Lyvia Verlynn	smlone-cRXUF
70100019	Andrea Tabitha Florencia Simat	smlone-aYpdT
70100020	Diandra Ezra Nauli Simatupang	smlone-oLNUF
70100023	Evonne Gwen Lim	smlone-iTL1s
70100027	Daniel Goh	smlone-62IJ4
70100028	Elaine Gwen Lim	smlone-zx1hN
70100037	Abigail Rhea Lim	smlone-rQzgd
70100041	Raisha Adila Gunawan	smlone-s6ixu
70100042	Jessica Sharon	smlone-SjFkk
70100046	Kirania Inara Azalea	smlone-qKoLC
70100047	Keyzia Faiana Daulay	smlone-vHLX3
70100051	Enzo Howell	smlone-hGWTT
70100052	Darrel Hizkia Tambunan	smlone-3cjvt
70100059	Rebecca Florencia Siregar	smlone-hDDoe
70100060	Lincoln Blaine	smlone-916Iy
70100061	Colleen Blaine	smlone-ySm20
70100062	Nichole Hasan	smlone-B5ftn
70100063	Calysta Celorine Bakara	smlone-FpMAc
70100064	Rachel Nathania Situmorang	smlone-6nFC8
70100068	Radinka Agra Sitepu	smlone-5mYD0
70100070	Keysha Kania Ramaditya	smlone-mYUDo
70100071	Muhammad Al Khawarizmi Fairel	smlone-tnZxJ
70100075	Maro Louis Dear Purba	smlone-zuCkA
70100076	Marwa Alya Sakinah Rangkuti	smlone-MVMLh
70100077	Aldiana Masha Lovelia Br Sembiring	smlone-q4Zk4
70100078	Sakina Alima Regune Harahap	smlone-kLDOM
70100080	Dewi Syaahira Sabina Siregar	smlone-vIyBu
70100086	Maria Graciana Chica Purba	smlone-2fKKo
70100090	Annisa Letizia Shanum	smlone-BCNMz
70100098	Erland Sohilida Laia	smlone-xhr4q
70100102	Bryan Taslim	smlone-tKmuC
70100106	Dareen Davinci Ginting	smlone-znZjJ
70100112	Fathi Arkan Wiyatmika	smlone-gKYln
70100113	Jiselle Hartanto	smlone-QJI37
70100117	Akhdan Arief Athaya	smlone-Gyaj9
70100118	Cladys Nadine Frietania	smlone-d9545
70100121	Shane Anthony Jawson	smlone-KvNX9
70100122	Shadrina Azheema Lubis	smlone-fUZCa
70100123	Shafiqa Adeeva Lubis	smlone-uTtqL
70100126	Berliando Lovely Sihombing	smlone-e9zOj
70100127	Gabriel Ihut Martuaro Sihombing	smlone-Ebi3L
70100128	Syia Kim	smlone-HDs9S
70100130	Muhammad Rafa Al Siena	smlone-Qiecv
70100131	Clairine Bellvania Gavrila Ginting	smlone-31EaJ
70100133	Lionel Maverick	smlone-wo8wP
70100134	Diandra Santika	smlone-YX6GX
70100135	Adib Nufal Wibowo	smlone-SWeS8
70100136	Syakirah Khairani Jamilah	smlone-qwtEb
70100139	Daniella Demeintieva	smlone-DNux8
70100140	Gabriella Theofanny Putri Meliala	smlone-k8Doh
70100143	Kaleb Edgar Goel Hasugian	smlone-oVFvW
70100144	Faqih Fadhilah Wijaya	smlone-cyIUB
70100145	Hafiqa Raikhsa Karo Karo	smlone-6uuxO
70100146	Alexa Brianna Tambunan	smlone-0Fn9B
70100147	Faza Kiyana Azdah	smlone-OSRui
70100148	Davina Elisha Ginting	smlone-T4BUF
70100149	Jaeson Nathan Yap	smlone-Ejbqo
70100150	Nadhira Calista Purba	smlone-CPGf6
70100151	Fakhira Idris Harahap	smlone-X2wcZ
70100152	Abigail Carissa	smlone-iORFk
70100153	Dareen Azel Matthew Sembiring	smlone-3tngz
70100154	Ashera Natama Sitorus	smlone-Zkikc
70100155	Stella Aprilia Sianipar	smlone-7yWIa
70100156	Tengku Muhammad Malik Al Fatih	smlone-88XfH
70100157	Faqhan Asshadiq Winata	smlone-usR1z
70100158	Gracelyn Patricia	smlone-XAmHp
70100159	Nadia Fathaniah Chandra	smlone-icFwf
70100160	Jordan Noel Yap	smlone-I1jOE
70100161	Khezya Queen Zareen Br Panggabean	smlone-ffy3T
70100162	Arya Satya	smlone-E6XPa
90100001	Rowan Maverick Ang	smlone-5RuTi
90100002	Giselle Liandy	smlone-YuXdY
90100004	Jeovenna Cangie	smlone-EgdbB
90100005	Felynn Holy Richson	smlone-CFCo4
90100007	Carrick Classico	smlone-YVpvA
90100010	Chloe Marjorie Wen	smlone-Pc0nl
90100011	Chloe Quisha Anggara	smlone-DlxLM
90100013	Candice Julian Sakiwa	smlone-HDhlx
90100020	Winston Hubert	smlone-li63v
90100021	Aidan	smlone-Bf1CS
90100022	Jeanice Wu	smlone-DXIFI
90100024	Welceline Charissa Tsjin	smlone-FojEQ
90100035	Carlen Edeline Br. Keliat	smlone-BuVOf
90100036	Carlos Ferdinand Putra	smlone-jK1Q3
90100039	Reynard Alderich Guntur	smlone-fahPS
90100042	Justin Nawi	smlone-3HmF4
90100043	Valentino Owen Liu	smlone-xdCGB
90100044	Velove Alexa Winstan	smlone-tfykL
90100045	David Howard	smlone-hrKrT
90100046	Hugo Maximus Ling	smlone-zbm8C
90100047	Bryant Maximus Ling	smlone-cLjEX
90100049	Harvey Susanto	smlone-l8oIV
90100055	Felicia Tham	smlone-tq5ZT
90100056	Thalissha Yeonan	smlone-4IppJ
90100060	Alfred Smaver Tanasal	smlone-zdcFA
90100061	Elaine Gabriella Chandella	smlone-wB7Ui
90100064	Olson Arfayo	smlone-NIpvQ
90100066	Celine Oubre	smlone-UktZQ
90100067	Victor Alexander Winstan	smlone-lKbdh
90100068	Ixchel Lowell Tankiono	smlone-ELgM2
90100070	Jack Austin Sia	smlone-YMak8
90100074	Faulina Theresia Pangaribuan	smlone-W75uq
90100075	Kingsley Alisson Tenang	smlone-mVPXB
90100079	Gracella Cangie	smlone-EBZE1
90100080	Vanessa Cangie	smlone-uY4Wz
90100081	Hayden Fredderick Halim	smlone-pzegg
90100082	Tang En Xin	smlone-dvAOK
90100083	Filbert Laithen	smlone-SjS3r
90100086	Eric Williarn	smlone-ENTxR
90100087	Finn Maxwell	smlone-egtfJ
90100088	Khairiy Raka Azizi Hermansyah	smlone-icq8a
90100089	Alvyn Zhu	smlone-clSRy
90100090	Alfarizy Raqila Hermansyah	smlone-HiUss
90100093	Jesslyn Lee	smlone-O1Wa0
90100094	Feliks Ananda Lee	smlone-rkliM
90100097	Annabel Audriana	smlone-LetzB
90100099	Rowan Tirta Lee	smlone-GC0JZ
90100100	Jasmine Zhang	smlone-xlweC
90100101	Jayden Zhang	smlone-GAEQ2
90100102	Chloe Marche Khu	smlone-Abjc2
90100103	Claire Eugenia Khu	smlone-7nxjl
90100104	Hannah Sophia Salim	smlone-YI02Q
90100107	Stoffel Swandeez Angkasa	smlone-B0jP1
90100108	Vergio Gavino Chaikoff	smlone-LZXoZ
90100109	Jolin Thianda	smlone-YCUB5
90100112	Richie Alvaro Tandinata	smlone-OxQLQ
90100113	Reynard Shendior	smlone-vFoVI
90100114	Kate Elizabeth Huang	smlone-2pX7T
90100115	William Lauda	smlone-0xgBM
90100116	Janessa Hofang	smlone-d99MH
90100117	Jarell Hofang	smlone-qDX9Y
90100118	Jesslyn Hofang	smlone-jSVf6
90100120	Jocelyn Sydney	smlone-X3w47
90100122	Tiffany Toh	smlone-jaGY7
90100123	Trevor Toh	smlone-Pve7j
90100127	Davin Bradford	smlone-7hcFa
90100128	Dustin Bradley	smlone-yTwJl
90100129	Jasmine Ryana Ngadimin	smlone-V2YzB
90100130	Maurice Claire Genevieve	smlone-i5WoY
90100131	Gillian Natalie Wilfred	smlone-JXZsz
90100132	Louis Adrian	smlone-7hd6Y
90100133	Josh Andrew	smlone-e6lmg
90100134	Rodrick Stefano Halim	smlone-Nm6l7
90100135	Rainie Lynn	smlone-QsRfA
90100136	Miho Qanitah Sihombing	smlone-wsTpW
90100137	Keiko Hanara Sihombing	smlone-rW7CI
90100138	Vyon Wynter Huang	smlone-HG6fm
90100139	Mikayla Seline Wu	smlone-NEd6U
90100140	Jadellyne Gretchenagatha Zhuotio	smlone-cafpT
90100143	Jason Lewis Theo	smlone-DR2ah
90100144	Vincenzo	smlone-2FYv0
90100148	Kei Evander Buhari	smlone-S8uxm
90100153	Ethan Putra Gotama	smlone-JK1VX
90100154	Emmeline Aurelia Lie	smlone-rOo0t
90100155	Nathan Archie Gunawan	smlone-90pLR
90100156	Nicole Anastasia	smlone-dxgMr
90100160	Klarissa Evania Buhari	smlone-ttXNe
90100161	Harvey Taufik	smlone-mHjbY
90100163	Videline Gillian Chaikoff	smlone-GxGgP
90100164	Jarred Eldridge Tantama	smlone-59uR1
90100166	Reinz Stythan	smlone-G1dTa
90100167	Alicia Quinn chandranata	smlone-5yVKu
90100168	Madelyn Henryetta Fang	smlone-tlvMC
90100169	Eleora Iskandar Liunardi	smlone-GKY5J
90100170	Viyona Gavriela Muis	smlone-oqU6U
90100171	Eileen Yui Chen	smlone-WCLza
90100173	Jeneiro	smlone-YVEac
90100174	Otto Valerino Lim	smlone-6oZBt
90100175	Jovan Leonard Lui	smlone-HA0BZ
90100176	Rahma Nakita Afifah	smlone-Vtjq7
90100177	Dominica Cherish Sheiramoth	smlone-FHXa4
90100178	MIRACLE HUANG	smlone-3WE8N
90100179	Emily moraine hakim	smlone-hyNHa
90100180	Jayden jiefferson	smlone-wTdKb
90100182	MAXWELL TENAR	smlone-Xm648
90100183	Heinz victorio zhou	smlone-LkykW
90100185	Natasha Clairine Wu	smlone-o5fKp
90100186	Samantha Clairine Wu	smlone-YiQh3
90100188	Rebecca kelly ashari	smlone-Kz7Ev
90100189	Abigail avery ashari	smlone-KNyjY
90100190	Daphne Nathania Ang	smlone-EzfnL
90100191	Bosco Lim	smlone-7QLIl
90100192	Jayden Jingga	smlone-5Sqq6
90100193	Tyra Louise Tohnika	smlone-mjrcr
90100194	Tyler Howard Tohnika	smlone-vparc
90100195	Sarah Oktorela Sitorus	smlone-KofU7
90100196	Jordan Philip Wihono	smlone-fcqd5
90100197	Jeffrey Yap	smlone-I2M8R
90100198	Jordan Swiss Cliftan	smlone-MRkCa
90100200	Galent hansen wuner	smlone-kWTuD
90100206	Metta Louise ellen	smlone-kUhou
90100208	Patricia	smlone-906gG
90100209	George	smlone-aD2nY
90100211	Callista Aurelia alven	smlone-74Lmz
90100214	Louis kendrick	smlone-1U5Jd
902	Malcolm	smlone-9dvAV
903	Harvey Oliver Lee	smlone-dXIgQ
904	Callista Aurelia Tasma	smlone-RZrkC
909	Keona Jaileynn Lawrence	smlone-a4pYk
910	Michael Thamida	smlone-dtmCA
911	Meivellynn Thamida	smlone-IQWsR
913	Roselie Kirana Wijaya	smlone-RaPvv
914	Leia Kaytlyn Tioe	smlone-oiU6T
922	Victoria Cenata	smlone-IxRx2
927	Richela Stanlay	smlone-1LPmn
929	Trevor Hartono Lee	smlone-09IyY
932	Olivia Tjoa	smlone-EjK1X
933	Ivy Jeane Chanella	smlone-4DHiw
935	Gisella Nyoto	smlone-STaat
937	Jillian Claire Kuanrius	smlone-kTc2H
938	Reagan Nyoto	smlone-4kAey
939	Rexcaden Jazper Shu	smlone-BXtXc
942	Elaine Viandi	smlone-0wbvz
945	Angeline Felice Theo	smlone-QzQes
947	Nayyara Ayaskara Prakasita	smlone-nR3Vz
948	Erick Winner Teo	smlone-6Lpjw
950	Audrey Madison Loewe	smlone-hHWbj
951	Mavin Jericho Phen	smlone-aMIGC
955	Naomi Grace Edward	smlone-QK6ir
956	Aileen Sophie Kesuma	smlone-OZoSA
962	Ananda Putera Ngadiman	smlone-Yeg6T
963	Yasmina Athirah Rifqi	smlone-OOxSV
964	Yazeed Abizar Rifqi	smlone-QBnVi
965	Modric Agusta Daruma	smlone-cE8jx
968	Lady Valery Sinambela	smlone-NcJSQ
970	Annabela Himeko Winarta	smlone-AjcQA
980	Ezio Lim	smlone-xOGtF
981	Joey Milan Phen	smlone-l85oi
982	Abigail Hazel Tamin	smlone-3fdqi
986	Jason Allen Tjoa	smlone-t8x7w
987	Caren Pandiago	smlone-l2iIc
988	Gavyn Wijaya	smlone-W062h
989	Federico Fredelyn Jeoh	smlone-JQreg
990	Zason Riady Ko	smlone-QXIDm
991	Arya Kho	smlone-tquit
992	James Ananda Wijaya	smlone-UJvE9
995	Qori Putri Syahviah	smlone-XpNXP
996	Venesia Anggini Purba	smlone-4M1s3
997	Jovin Limcoln	smlone-cTYoO
998	Fedrick Wijaya	smlone-HngGn
999	Annabelle Grace Wu	smlone-9RO8K
`;

// Function to sync trainees with their exact password from the list
async function syncTraineesWithPasswords() {
  try {
    console.log('🔄 Backing up current dashboard_trainne table...');
    const backupResult = await db.query('SELECT * FROM dashboard_trainne');
    const backupPath = path.join(__dirname, 'trainee_backup_before_cleanup.json');
    fs.writeFileSync(backupPath, JSON.stringify(backupResult.rows, null, 2), 'utf8');
    console.log(`✅ Backup successfully saved to: ${backupPath}`);

    // Parse raw text input
    const parsedTrainees = [];
    const lines = rawText.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      // Match ID (digits), followed by spaces/tabs, followed by Name (anything in between), followed by Password (smlone-...)
      const match = trimmed.match(/^(\d+)\s+(.+?)\s+(smlone-[A-Za-z0-9-]+)$/);
      if (match) {
        parsedTrainees.push({
          id: match[1],
          name: match[2],
          plainPassword: match[3]
        });
      } else {
        console.warn(`⚠️ Could not parse line: "${trimmed}"`);
      }
    }

    console.log(`📋 Parsed ${parsedTrainees.length} trainees from the list.`);
    const parsedIds = parsedTrainees.map(t => t.id);

    // Delete any trainee whose ID is not in the parsed list
    console.log('🗑️ Deleting trainees not in the list...');
    const deleteResult = await db.query(
      'DELETE FROM dashboard_trainne WHERE id NOT IN (SELECT unnest($1::varchar[]))',
      [parsedIds]
    );
    console.log(`✅ Deleted ${deleteResult.rowCount} trainees not in the list.`);

    // Upsert the parsed trainees, hash their specific password, and set phone to NULL
    console.log('🔄 Syncing, inserting new, and updating passwords for matched trainees...');
    let updatedCount = 0;
    let insertedCount = 0;

    for (const trainee of parsedTrainees) {
      // Hash the specific password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(trainee.plainPassword, salt);

      // Check if trainee exists
      const check = await db.query('SELECT id, status FROM dashboard_trainne WHERE id = $1', [trainee.id]);
      if (check.rows.length > 0) {
        const existingStatus = check.rows[0].status || 'Active';
        // Update: set phone to NULL, save hashed password, and ensure name is synced
        await db.query(`
          UPDATE dashboard_trainne
          SET trainee_name = $1, status = $2, phone = NULL, password = $3
          WHERE id = $4
        `, [trainee.name, existingStatus, hashedPassword, trainee.id]);
        updatedCount++;
      } else {
        // Insert new
        await db.query(`
          INSERT INTO dashboard_trainne (id, trainee_name, status, phone, password)
          VALUES ($1, $2, 'Active', NULL, $3)
        `, [trainee.id, trainee.name, hashedPassword]);
        insertedCount++;
      }
    }

    console.log(`✅ Database synced successfully!`);
    console.log(`   - Trainees updated (password updated, phone cleared): ${updatedCount}`);
    console.log(`   - New trainees inserted: ${insertedCount}`);

    // Create a beautiful text report
    let reportContent = '============================================================\n';
    reportContent += '          SMLONE TRAINEE STUDENT CREDENTIALS LIST          \n';
    reportContent += '============================================================\n\n';
    reportContent += `Total Trainees: ${parsedTrainees.length}\n`;
    reportContent += `Passwords Set & Updated: ${parsedTrainees.length}\n\n`;
    reportContent += '------------------------------------------------------------\n';
    reportContent += 'ID\t| Name\t\t\t\t| Password\n';
    reportContent += '------------------------------------------------------------\n';

    // Sort parsed trainees by ID for nice report formatting
    parsedTrainees.sort((a, b) => parseInt(a.id) - parseInt(b.id));

    for (const item of parsedTrainees) {
      const paddedName = item.name.padEnd(30, ' ').substring(0, 30);
      const paddedId = item.id.padEnd(6, ' ');
      reportContent += `${paddedId}\t| ${paddedName}\t| ${item.plainPassword}\n`;
    }

    reportContent += '\n============================================================\n';

    // Write to trainee_passwords.txt
    const outputPath = path.join(__dirname, '..', '..', 'trainee_passwords.txt');
    fs.writeFileSync(outputPath, reportContent, 'utf8');
    console.log(`📄 Credentials list has been rewritten to: ${outputPath}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error syncing trainees:', err);
    process.exit(1);
  }
}

syncTraineesWithPasswords();

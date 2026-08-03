const fs = require('fs');
const db = require('./src/db/neonClient');

// Raw user text containing ID, Nama, Status, YouTube Link
const rawInput = `70100019
Andrea Tabitha Florencia Simatupang
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo0Td1xXItlCH6KPom2Evdx
70100020
Diandra Ezra Nauli Simatupang
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZpWGgCoQXVH69v3qNXIlub0
70100003
Cherisse Wong Jono
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoPCS_Y-Ysfo_X4P6t1lcrk
70100001
Katrisha Davinia Lim
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpTL7iutDdjycW0DndRvV1n
70100004
Maryam Shareen Anandifa
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqeHDUoDz_WvLp6OMBn87T5
70100005
Lyvia Verlynn
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrQBYePbLkhQ-ZM60xP2WL1
70100008
Clarissa Ruthana Sipayung
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoTQpy9rcJr6cfkF6HxAjZQ
70100007
Jevany
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrx_fsCC0T30_rzAP8F4tCF
70100022
Josandy
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpUf4nsAVSY0ZSNNohtu_W6
70100023
Evonne Gwen Lim
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVokhuDVpRXl3yCTUJQBUCtQ
70100021
Rafael Daniello Tamba
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVr020OJ5N5_TmcBeWbO8vxa
70100010
Nicole Rikki
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpNKr-JYaavh8OsFYdQ-RsE
70100013
Aldin Roi Angkasa
https://www.youtube.com/playlist?list=PLmfta-_9FZVrC3hmeT6fp0DrPy4iQnolG
70100014
Desmond Dinata Ong
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqFOESky5Cu-o8ZXZZVNy_y
70100016
Dwayne Jzekiel Angsana
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqhN783jozk-Sgv3jOooysU
70100028
Elaine Gwen Lim
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoHv-3FADrJazmEZllah0XM
70100031
Rahardian Ozil S
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpCo2NM_JtKVK_AzRG4MMmR
70100034
Muazzam Khalifi Adera
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpp7BrR-PtvjfyweNwslg84
70100035
Fasya Putradinata Syam
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVru_u6aKNQqDGxBZMpJXiQl
70100036
Gilbert Faustin Wijaya
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo0fVU4z2x0Oh8xlGJkDBat
70100037
Abigail Rhea Lim
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVqvj0f5ljRaSRZJL5673Ky8
70100038
Richard Alexi Pratama
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpxFO_RjLEAdJ8gJesbw06R
70100039
Gwen Valerie
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVor6fMU3eV70OYzmcqoPltv
70100040
Mario Dominic Warouw
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoG9qQ_A3yXuw7l5UJkdSQG
70100041
Raisha Adila Gunawan
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVpquDrEGgTXpmTCzkwmMauX
70100042
Jessica Sharon
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr9aus_J8rW3grh9zodXv07
70100043
Enrico Felix Daniel Siagian
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVplAj0tIjq86b-cpDAikO36
70100044
Amelia Natasha Siagian
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpd5oWyBvxo9WZWx_ekD200
70100045
Hansen Cornelius Goklas Siagian
https://www.youtube.com/playlist?list=PLmfta-_9FZVqMdFqHhMQRERl9E7gQibjp
70100046
Kirania Inara Azalea
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoBbww5pyoc64PIW19dJ3LG
70100047
Keyzia Faiana Daulay
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrqyVgPgjUhmc1zh0msaFY4
70100048
Moreno De Truman
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVr7-WRh_5B6as3ir5lKKx0Y
70100049
Eillen Faustine Wijaya
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo5ZN4vf-1XMYhKftLz74Dq
70100050
Ellys Faustine Wijaya
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrgAbyPOc5pnii54KnrZkLR
70100051
Enzo Howell
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoOclXRbEkz4BYtjpXHFDex
70100002
Matthew Yeo
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoQYnGVP6cq-nXqwd-1_HyG
70100052
Darrel Hizkia Tambunan
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVrxnKIzhIzHfeAD2MhZ7fa_
70100053
Ghassan Ghazali Ginting
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVq3LHTXVerfOwjqurWdg6MG
70100054
Olivia Nooman
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoyOoP-rWPuPcDHWXeNkmSI
70100055
Clarissa Kimberly Luvalencia
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpl91g4YESNI7aLUfiEP0cu
70100056
Jason Louis
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo0OagsuPACuIWEX2Ip34jr
70100057
Evelyn Frelda Gurning
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVos12PbkiJmvlBkTXnncxAp
70100058
Anya Pehulisa Ginting
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpnCoO3FUnLA4o77Z86N-ZS
70100059
Rebecca Florencia Siregar
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVq60iyWrM3_XHZ0IyDJ-5hQ
70100060
Lincoln Blaine
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoeZw0sQzfMA9g35PkM_g3Z
70100061
Colleen Blaine
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrJNYZ4jrmVhq0bDYfjohji
70100062
Nichole Hasan
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo0B_4WPOrKALk1xvEMj7z4
70100063
Calysta Celorine Bakara
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpa8C74NtQGBR0XKPBUGmdQ
70100064
Rachel Nathania Situmorang
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVo_se5qGJrBK-58pWiy1CiG
70100027
Daniel Goh
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrxTEdqbSbgH4yC87-Y6v40
70100067
Sophia Rachel
https://www.youtube.com/playlist?list=PLmfta-_9FZVrJAkD8oSAXcIA7x3tCfrpm
70100069
Al namira safitri saragih
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqPgFEcxm3mJOvm11xoOre3
70100068
Radinka agra sitepu
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpZLffOKX-h0xNfNNulfGJh
70100071
Muhammad Al Khawarizmi Fairel
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqotMsfnrtV9y2m_AGf9dum
70100073
Tristan Arsenio
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoFVWKo2uKeVcSuTi5sAp11
70100074
Darnell Samahea Lakhomi Laia
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpnVz8_cox846utzYsf_gXQ
70100070
Keysha Kania Ramaditya
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr75g7hW2lhXbtvwfdP5nt9
70100071
Muhammad Al Khawarizmi Fairel
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo07zihH1nhH386OCSrDopI
70100073
Tristan Arsenio
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVr0sOs3MJTdmXCQUxTO53C2
70100074
Darnell Samahea Lakhomi Laia
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVosYCJ5hwBTqvoHqpcqRxoI
70100075
Maro Louis Dear Purba
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpUAaNvMvMYMVjhJAJ2McEI
70100076
Marwa Alya Sakinah Rangkuti
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVp-v7s3OqV3VEr3VYhyV4j9
70100077
Aldiana Masha Lovelia Br Sembiring
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpdRi8jjmfk-JSrcw4P9-R7
70100078
Sakina Alima Regune Harahap
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoKyw_gh-NBM8LwBlGSlj5_
70100079
Almira Izanti Kamilah Daulay
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVre3C2pn-rR4FBxQiYIcVPt
70100080
Dewi Syaahira Sabina Siregar
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpXI_zdcB1AsZYHcjwrHPI0
70100081
Carmen Tjokromitro
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpcZqKme8AKn15ZUjfko7aA
70100082
Careen Tjokromitro
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVr08QJkMAHDB5rpRgfk2yZf
70100083
Breanna Octovindo
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVr6Lv0RpzatCLBfz5wnQwez
70100086
Maria Graciana Chica Purba
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpQbw2DYnsTjbvRcKrIv1CJ
70100087
Micella Alexa Pinem
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVptssXSkb3fvUxFEsuFf3Si
70100088
Mikhayla Tabita Pinem
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpguUdfBdblW4WWCP3PFG89
70100089
Aurelia Intan Leung
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVq6vI1S6TlMow_b_1rc9_YW
70100090
Annisa Letizia Shanum
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpe5F0XiyTUnPG_x8ArNGdN
70100102
Bryan Taslim
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqSPHhls4npu1VR8Ct6H_v0
70100106
Dareen Davinci Ginting
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVraUiqtnBCnz8CAnZXTQAx_
70100110
Filbert Wandrew
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo1RGIFjMUW2wO-AQgVhdK5
70100111
Keshia Nakia Hayfa Azka
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo5v7NpThk-r0hVXlL2C0hC
70100112
Fathi Arkan Wiyatmika
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpVbXPGlGCirGHAELwNe786
70100113
Jiselle Hartanto
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrsPXThQwIDY2hfiYNST-8i
70100115
Candice Alicia Wai
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVq00CNNpC0lCO5sUJYNxgEL
70100098
Erland Sohilida Laia
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVpC8qkwbHzSk3HPrecuU7Sc
70100116
Rayyan Putra Raharjo
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVq2zTbfZSjvYyeXDz6I7-Ca
70100117
AKHDAN ARIEF ATHAYA
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqhX_GpWCcsf6E-KAmDeZAj
70100118
CLADYS NADINE FRIETANIA
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqzeN8k8fKOLwrMG62W2MWe
70100119
Chew Zi Yang
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoEakP9RWzHBSAuPLT2XTLo
70100120
Aishaqillah Syifatin Mahirah Kurniawan
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoDRYBG3OrKevtYkVwOfr2X
70100121
Shane Anthony Jawson
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoPG93luky6FT9p9fOk8ABY
70100122
Shadrina Azheema Lubis
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoJ_Zu2q1lp3Vvd7s7QbHg1
70100123
Shafiqa Adeeva Lubis
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVocxkWGv_4OSuVWLdXM2Wta
70100124
Mikayla Aqueena Shaquilla
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoRjr5zm2NH9-ONsk4B1QVd
70100125
MONI LAPRINCIA BR GINTING
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpRnqVl_OH4Ve9-tRF0J0gf
70100126
Berliando lovely sihombing
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqhHVF4atG1QNOhqn3tJsU-
70100127
Gabriel Ihut Martuaro Sihombing
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVotMavm3-JibseNltT0AD0a
70100128
SYIA
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrD2C8u-beQr_qybhv9dSO3
70100129
Alliya Ellduci Dermawan
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqtQOEK6M38RurUiNT7lfkr
70100130
Muhammad Rafa Al Siena
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqj6y37hhnKPZjCynZt7wYa
70100131
Clairine Bellvania Gavrila Ginting
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoDfLYULU1Ra_qXyWSx1DKo
70100132
Devin Suhendra
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVobKsVJ3ZYvCvWbRE-tDUIG
70100133
Lionel Maverick
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrfSVnCJ14dXu4qxlOitOLT
70100134
Diandra Santika
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpqPp8NKa0Jbo7xX4MMMtry
70100135
Adib Nufal Wibowo
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo-Cv9CXjEM9ViZneCkXD6E
70100136
Syakirah Khairani Jamilah
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqKycaPFwbV2Ke13TFZhAF_
70100138
Maura Shaqifa Rubyna
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqsIZuXpQaECmKR63NhtUpK
70100139
Daniella Demeintieva
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVomcE2ZtwfuOnCaXdzXmkYK
70100140
Gabriella Theofanny Putri Meliala
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpmZgsu3ahEITzhGCNM1u9G
70100141
Aqeela Shafa Batrisya
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrf2AXN29FRkaz76Ex4xfUo
70100142
Shane Nathantaras Tarigan
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrVdA3Gkob_Qsucv0sn2Faj
70100143
Kaleb Edgar Goel Hasugian
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVp8mGT4WJ3_wVSh7IhV33mv
70100144
Faqih Fadhilah Wijaya
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVq6cunt3Bhhzp-ORClOc3V5
70100145
Hafiqa Raikhsa Karo Karo
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVq5eySuyglwMdve8X3r-jB4
70100146
Alexa Brianna Tambunan
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVreeOywAF_qidjPbeACJ_aR
70100147
Faza Kiyana Azdah
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpKoupp1l4mCTt3Nmv-fuSC
70100148
Davina Elisha Ginting
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoEMLFlihri_UkDjQJHTVGp
70100149
Jaeson Nathan Yap
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqx7K2s5bh3Fm1N9yOgzsrA
70100150
Nadhira Calista Purba
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr59AR90D2uKEp_kCRd5ZNp
70100151
Fakhira Idris Harahap
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVrBQWKAbDUpZWU3Vo4u6qDU
70100152
Abigail Carissa
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqe5X8RRVIrTJW5kCIVyauo
70100153
Dareen Azel Matthew Sembiring
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpg5MQ3L6LyAv5RTfEb6j5d
70100154
Ashera Natama Sitorus
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoaIfa3qyk0DaIqbCJcVVAs
70100155
Stella Aprilia Sianipar
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrGxXVj4c8U8ZiIjFlJAn3K
70100156
Tengku Muhammad Malik Al Fatih
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVopd2vZPm3p2dWca4LyvQ24
70100157
Faqhan Asshadiq Winata
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoLPQ-pMogo0vsfwgYZe_KN
70100158
Gracelyn Patricia
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo9gTkXzW43rrzvHhJry9XV
70100159
Nadia Fathaniah Chandra
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrJMI2GZ_bq_UsNn1hVkqWe
70100160
Jordan Noel Yap
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo8boUBrPuVMkCg0vI71vvN
70100161
Khezya Queen Zareen Br Panggabean
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoONgwkSEbH0KgumQ3O8BL1
70100162
Arya Satya
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoAkfceQKKtTc3majy0B9cs
70100165
Ghazia Raesha Afthani Lubis
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpNbUm5wMS8mm2PXgfJN10H
70100166
Farrin Rafania Shezan Lubis
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpuBx6ufU-y385o9A3vllFo
70100173
Muhammad Naufal Athariz Ritonga
Active
70100174
Jerrick Onggoro Hakim
Active
70100176
Muhammad Asyam Haris Tanjung
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqH_jynTEVkNM6rbDx8dne7
70100179
Doria Marchisia Giussevine Saragih
Active
https://www.youtube.com/playlist?list=PLCiqaJ6lwMlk
70100180
Jevano Septarey Saragih
Active
https://www.youtube.com/playlist?list=PLbjXEtzYy8ew
70100184
Atha Malik Chairmawan
Active
https://www.youtube.com/playlist?list=PLHG5BBDH96rM
70100185
Alice Nathalie Brigitta
Active
https://www.youtube.com/playlist?list=PLHLnJ0tUqh-M
70100186
Alvaro Gavriel Batara Sihotang
Active
https://www.youtube.com/playlist?list=PLP1VbrDUmG80
70100187
Graccyella Martgehaan
Active
https://www.youtube.com/playlist?list=PLbeFG2WN9UpA
70100188
Latisya Naya Alamsyah Nasution
Active
https://www.youtube.com/playlist?list=PLZ-BBCqbnc4g
70100189
Lashira Naifa Alamsyah Nasution
Active
https://www.youtube.com/playlist?list=PLKpTwxgtHR1Q
70100190
Arta Glory Hutasoit
Active
https://www.youtube.com/playlist?list=PLGbbvda-6Bhc
70100191
Yosihana Hutasoit
Active
https://www.youtube.com/playlist?list=PLFpuswIDSUUs
70100167
Arsa Clianta Saragih
Active
https://www.youtube.com/playlist?list=PLTFvnOhvwIf8
70100168
Mora Leticia Sinaga
Active
https://www.youtube.com/playlist?list=PLMgj2jlcYSP0
70100175
Ondo Vico Fidelis Giant Sitohang
Active
https://www.youtube.com/playlist?list=PLd3zS2M6edic
70100177
Raphael Evan Hiro Ompusunggu
Active
https://www.youtube.com/playlist?list=PLf6UYKlWLf_w
70100192
Kania Laviza Andhini
Active
https://www.youtube.com/playlist?list=PLOhxzUPQ6ReE
70100193
Nadhira Ayria Verdian
Active
https://www.youtube.com/playlist?list=PLf4tUJYJj4wU
70100169
Warren Leander Wichael
Active
https://www.youtube.com/playlist?list=PLIr_DKP7Z2-Y
70100194
Danella Christabel Hasean Saragih
Active
https://www.youtube.com/playlist?list=PLE7nNq-0MpP8
70100195
Marisca Agustina Br Surbakti
Active
https://www.youtube.com/playlist?list=PLAk7gwIpwSsk
70100196
Abdullah Syafa Assyunni Rangkuti
Active
https://www.youtube.com/playlist?list=PLVCNXux4sjAQ
70100197
Keira Agatha Dameria Resubun
Active
https://www.youtube.com/playlist?list=PLb-2b2afjU1U
602
Alexandra Joan Micheline
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVop92RqT2JpITKT_aWgPyl0
601
Mikaella Hutteleigh Ng
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVojpUgLfc3mEF6wwZMbyzPd
636
Zia Arafa Khairina
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo9bQSxlsoAjojgdvxx6wa8
671
Chloe Bernice Tan
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoEx1aAXnpia0G1VTExIouo
614
Rayden Chiang
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoaAEAUe0jGN8x7zHAMqpU5
610
Josh Frederric Ang
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrwFTTA7bCeO4kD_4ex-8Xn
618
Yamin Yenardo
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrMG79f-L7dNXrFTOTP2OXK
613
Junior Auson Halim
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo3VkheGNHfXKbqEKNGsOuj
599
Nadya Aretha Ui
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVq2-hOMqbYTW54bYnX8eO49
645
Marsha Ava Kaylana
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVouGZzbkw84dmhYhhLSgJBS
654
Rayden Oh
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpRtDdfhzlLiHMVQVpRu7Gf
672
Arissa Wijaya
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpa2W1EIxk8UBRvBQCwh0xO
674
Lorabelle Leon
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVr6FSJ3p1_jPuMuVrYfvOYh
675
Maxen Zo Leon
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpyI-yvCo6SKwV6UE64kHAs
676
Grace Alexandra
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVq1VJ_HEoOJzLfBcdtr8slR
680
Gracelyn Yap
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqB8muqUYzp24CQmhGrV9T5
681
Vanessa Sonata
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVptmA2UAz1Eb_1WVy6gmr_X
669
Veraldo Valentino Rusli
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoPrXE5Hx8F60318IrB53qr
683
Stanley Ace Lorence
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo1Fp4pLQH2aB7NbZJ0CyYs
686
Owen Linwood
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqi2xoQ8-TKIzxfvXv2m2Qe
697
Ruby Lie
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrCykRwUbnlYNTM_Mage7WH
318
Ellena Jocelyn Lasiman
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVr2miA2GkZgHU-NK-AddEM6
368
Felice Vallerie Angkasa
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqHXf12svtu6qo8sir0Iy1P
640
Amelia Laurence
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVobcCHc6UfzGtcSVVksJX1J
642
Feligio Beatryan Wijaya
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoiW83TmcXvinNAeVgABRIo
605
Philbert Charlin
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoz7s4GZdJPEryoP4yzPoA2
517
Jack Travis Lee
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqlt0ZMhn7RYPisTTqtKz6e
329
Vrederick Benaricco Tanjaya
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVpMGrl3EZIYpnG_7HyaLIaq
484
Arcelio Winston Laurence
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrx3XwMmNBm1FUzM1gptX-d
141
Russell William Tanner
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr0Bzoy7kwk0ITMVszO5exf
647
Celine Hadian
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVp2zJF3tL3tzNjKP6PEj6Pd
519
Valencia Wibowo
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrzR_iyg8be0gTdAS8VGRc6
518
Joe Jasper Lee
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVr48eJX6T_hcxGNAEHQRwZ1
607
Gilbert Charlin
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpL8nFWXihuOxZhuYPAyeqM
619
Gilbert
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoV5i-NVzMAkTlCsYjWahT9
478
Gracelyn Lawrence
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVq85IkiSc8IWde0UC7P4OM_
288
Carisle Vee Lovel
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrHYi2KERPLGC845Xmfc05C
339
Ellen Angelica
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrbP0WRS9NG9spxGQv4MBA3
482
Reizo Kazuo Wong
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVoYTjB1RWSSjThY8PS0eH1Q
493
Davian Anders
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVphaQbPx8UmXIQ5Mg5jIpkP
446
Victoria Juhana
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoK5WHoARKRFxSc1iTcuhed
588
Vallerent Viquel
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqMenV9rNIZK6jv_DYTEGAd
588
Vallerent Viquel
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqMenV9rNIZK6jv_DYTEGAd
563
Fellicia Lawrence
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoSYHemCOecvS8CDw6QJuPz
486
Nakin Ben Cuseline
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpxfPWus8XIvBkvS5syIZAQ
292
Dylan Raynald Sen
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqNgZN4s2EDyJQIR9zvnOje
592
Marcelys Salim
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpWEd0vdSeYYGgoCrHvlSmA
583
Yuvrelyn Edren Yie
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrh_kehyrTAqdzrfx5c2iSZ
664
Chloe Valerie
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo8w78E6HxMdodH2q25UbJ3
575
Mandy Ellen Sanusi
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVq4LsFHSJbS6hPB0EdzkazH
591
Joyce Mirabel Ng
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpwGkjfbbonnXRYYWtUDwFt
690
Raynard Ang
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpK2zCVZnmkUMCeDeIZmi7y
689
Russell Ang
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpY1-3ZQnGtgwiDvnoSfGiF
136
Claudine Joshanley
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrVLMjyC6r0ULGSghGuwk6f
606
Stella Fredella Teoh
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrB90jPFHjAA5YT6z6e1Sns
635
Hillary Kayra Orsontio
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo-U-SBLPRNHH2csfyblg9i
638
Chloe Olivia Ruslie
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr9sK_QKILgf01G26RKoxiW
637
Celine Cheng
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVp2khMTxSBP7_RN6y2awm6h
687
Philipp Torrien Chandra
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrQe63xojXtJwFscieLOj7B
707
Samho Gunawan
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqfpR5LlVxUbH5ggoDlhqU0
547
Winson Natio
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrD5J9ELW9YZ3Md2M0oke9X
475
Jacinda Viorenza Valentina
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVodbyyU-Lbi7HxK2l6c2P9b
595
Kathryn Jeslyn
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqRTloBu81n3jPEWXejcNVK
545
Brandon Chiang
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo9nhjt0AF5e0rv3q01w2GY
556
Lewis Darren Huang
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVq4riD3lBRgagv6zBMm4HEZ
477
Jovetta Kiyomi Limilo
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqeHCFSwFd88aTcC9GQrdbc
294
Katherine Argerikh Winata
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVq1TxclIiXHMidxcNL600C-
521
Taryn Tjan
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrOXytBLO3njVVXuMF37tom
440
Sofia Grace Wu
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqcBB9pR9sa0YJMemg5LG5d
549
Clairine Joshanley
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVp6oD4Nd9RKXlpvn2zYRV0f
582
Ethan Aldrich Lie
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVpYxRIMRhIM4yQ-ZL_yCDm0
410
Dyra Muntazsirah
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoJBsH8TH0CjlnsUH6ra-fK
269
Fresia Victoria Chendry
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqHVl2C27cvkHdQOO0GwEFv
429
Charrelle Anthony
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVr3212G18N3bbOzW2xVZb-u
646
Felivia Riandy
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVp30_6gUqVtpgaNDADWYrQ1
133
Oedia Ruth Vania
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVopqkSSYDCudma8JdOeNm70
268
Freya Anastasia Chendry
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrbBoZSNShvB9uQgKeS0C-H
661
Alexa Ellane
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVop7wjr8inncwrts3MR2wMw
68
Othniel Rolando Manson
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVr-t51oZ-O5IDoaKefwNk9D
701
Louisya
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrGe6mNgTM-nlrvwKfwb1tX
632
Clarisa Valencia Khomala
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoY8rfyzMPPbKDmcS_ELUT1
652
Michelle Budiman
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpXOCf59mH_gopeT2-vkaxy
596
Nevaeh Ferry
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpwkxNu9scPRtAAAItplyo0
476
Justin Rich Limilo
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrtcSwX3YQpWjbqULyMOZr3
679
Fiorenza Eleanor Wijaya
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVopxHH4uEqS4wPTLkL1hWZt
623
Angelina Setyawan
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo2vQREV2k3xfJDKJTE-KQT
624
Michael Setyawan
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVp9bll4qKvEmWguIyh02sfP
543
Stacey Carina Lim
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVr5Su1wT2kl3mELUCgzztTv
608
Ava Katarina Tjhe
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoitoLlUOi2WK_jc-jr_hk-
589
Aisyah Farah Setia Ixora
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrpHm6jl5_BNig-YCgRTFzB
665
Khoo Shu Han
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpy2jn9IxvHp3pEonPTEgv9
597
Stuart Hayden Tay
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpO2P3clUfbOlBIZCHC5O2V
603
Max Viandi
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVq7LNo6pwwvl9B_GKRA23an
621
Ufaira Tiandra Dalimunthe
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpcd6m90YkG3zG-dOeCNr1D
598
Mario Aretha Ui
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrAIzVptXnd_iKCgeHuVfwZ
612
Madelyn Chloe Wong
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo9n4fB2e9juJ2cQy6DEtlf
609
Rebecca Xie
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpNS2wXMtcHa_z4R1Y_t_ax
433
James Oliver Neoman
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoFUTxJZ3K0TXqtWXGby651
630
Nichole Gabrielle Santoso
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqwt01NPyIm0S6GIGCGJfJ1
400
Richard Axel Tjhe
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrR0RT2DrnGcsVjXKUJfQYA
650
Quintus Aurelio Tjhe
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpMeEyH3D1sa31mepOSY-A3
627
Vin Maxwell
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrgjZSmREBE1QQYNbZE0o9g
666
Khoo Kwang Wei
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVr4srblSMithmnBqC7TcAdJ
633
Fiona Jolys Chong
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVrmDx0eYILWgBe6nbkqh05V
644
Marson Nobleyu
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVogA1T_DeSIN1T_KTXya5kn
670
Christian Anderson Lee
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoCzVwoh0nuvKg_-j_o4wbl
631
Queency Joycelyn Yieginia
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoTIJZ9ZHkUOamynLBvKASN
528
Kiery Keionna Kie
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpwAjdmx4Joz_R1Pszkz7DV
587
Enrico Victorian
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrKQGfYpDj5TbM67H9TeJIh
569
Jo. Carel
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpXmDzy6dTf27Sh-Q6ymrrM
590
Zadden Tanaya
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrV9fmHhEkiOVpZxIoqik2Z
303
Lucas Zhang
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrcrxZLPOi7DtmFMUYuw_MI
653
Jermaine Eldwen
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpce3DN8T0XfDubs4uoTL1f
498
Jordan Alexander Lim
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqb4ujRkklO8v8XAlltOQNw
267
Darren Gabriel Wijaya
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpc5yzWKP_Vo0FTACyNIjzO
503
Wayne Lincoln Tansley
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqg3_TPEU73XUT919TltF61
125
Jayxen Maxwell
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrNiRBnXFsdswRgGlOnDdjT
659
Kimberlyn Alexis Holiverz
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqt8Rekmb-F0B_6kMC7UPgE
504
Wyatt Benjamin Tansley
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoC3jB2rTI4Fh2Nvz6N1Q5N
560
Ruiz Stythan
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrrshpVpG_PkPEcrUwM8r0b
291
Darrell Richard Sen
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpMnUP_CZbUM6Gt8Ft789B5
600
Gyan Lucero Joenardi
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrPGiykyju8wWOShA-0bSh7
617
Channelle Kimberley Wong
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoiO-LCClNGlU5W5sbe_fZJ
692
Alyssa Anne Wunanda
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVq445SdIiFyg2BUpfJLWSJm
537
Sunshine Angelia Kwan
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVq9dk54Qv1e6mLn-8H40N2x
536
Sky Alexander Kwan
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqJPz66tSXUofZRErY762F3
535
Harbert Ivander
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVos_FkDrWmYztQa2IchmiV8
494
Arsene Eldwen
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVr-ZDUBxEJWNzYUwziqMFrG
539
Giselle NG
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqetyis6hleOxVo-mLEweUN
472
Stuart Tjuatja
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrkoY6M6uEdeFSExH7OunNn
48
Justin Maxwell
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo7YaHFiRAoi2n6Ke4yBIyf
151
Kenshiro Leowardy
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVomQA2Nk2jB6aC5OOH7sTjd
128
Felice Naomi Tjiaren
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVprtGfNE27ohGAV6kR-QEjF
130
Anastasya Sofie Yohan
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVr64p1K5-LTdE1tAVeu0UnI
20
Nicholas Matthew Halim
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrX1zdsBKQuQ3QhOrOlELF7
531
Max Chen
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVrj2fs-9sFi_lqnyJP_en9y
304
Louis Zhang
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqV80iXVhPLOhYTh1vXfSbK
45
Aaron Goldwin Semarak
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVp7kvcNWVNc2imWg1nN4yxR
46
Marco Freddie Tjiaren
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqodYdo2DEKjDJcFukgmLyQ
307
Josh Derrick Phen
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoa8bKdQHUf5oPlxxF_mdWq
507
Abelvinco
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrgYgOjFkIP-l11nz-tf5hF
250
Ryan Eagan Cendana
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo7Dh_qobef3vXLMthDUI_n
423
Felysse Auryn Khobert
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVr_pdp39Rnqr7Av99PmXUEA
64
Jillian Rusly
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqwece6fZAKnvmyAyg34G4w
63
Cleona Vivienne Lim
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpRhW0fxGBkUjuMcweuUAXA
44
Stella Edlyn Kwok
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoruvPPq1MjOBDD2_ugvuSw
488
Khansa Tabita Sakhi
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoPFGw6ScuZ6B9q6Hlu3Q9y
579
Wilbert Tanaya
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqK8wmtGQ1C8kqPhqsGeYj6
309
Luiz Alvaro Diego
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqaAUAv4NmhGYVYU4sMwBbo
584
Ivann Raphael Ohary
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo27fT4gY5i8hzbyXrUx2M7
441
Kenzie Fernando Hugh
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVph1dncVD7flZjTcBkI2EMo
506
Clarabella
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqgCsL5aVEcOTjXRk3ZXMmZ
622
Zahra Ghaniyah
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVr_VMX5-5s13WIdxVQOW-JM
60
Sharleen Velicia Lim
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpJQHzrqCJkWR6N7xT_OZk-
616
Sean Bryant Wong
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoeguMcYhJ2EmwRN9S8QESM
333
Jasmine Yenarti
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrG7-uGrVbcu4YMBagmNiM_
295
Liv Agatha Jolie
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrzN4__CPFbx-rzPS_IcfF5
658
Hugh Rhys Cendana
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpZgCcPNDM_7Xk7n_FNUOFj
615
Louis Anthony Shen
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpWbbkz1QKTkEsWmbNekJaq
688
Evelynn Belle Wunanda
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpTEhiSZXO6OgWPJk4HRSuM
691
Vanessa Claire Wunanda
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpYcR23QZmp2-mxQ43S-PU-
483
Jolie Charlotte Huang
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVp2DIpATUwc37R-rO8Qilzu
443
Candyce Valezka Moiras
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVr0ef6U_SnyKg8b_xuY3t6P
571
Aurelle Sophie Kesuma
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqwUAXZJV-TkMxC2uiaEZyH
50
Kenichi Zhou
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr9DZ2ycD-NcisrQnaqdMB6
663
Jacqueline Simpson
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqqqjGVDekBMIr-ZKkAaSFM
553
Florencia Hewi
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpAppzbNCYCpBe-ThTZ9Iip
274
Candice Winardi Wong
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqgEGQDqBSC0EnMsXSHSC81
530
Lewellyn Lois Chen
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoEyUXj5vChoZIg0tOQtAbk
585
Harvey Wijaya
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoTlkotkxI1lPOPobiO4Fss
586
Annabella Wijaya
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpJyBUzqAu0DQlfPR93-5TL
152
Welton Padmoasmolo
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqaHv9G_dL-_1BFGkWyA_WN
272
Jocelyn Basirun
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVruVsCeBmNDth43QAu14L2_
82
Nicole Mila Khoman
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoXjt00pi3W0Uf-2d2300E4
445
Sherlyn Mireil
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVolzW0-K_3RQFM5zMQmvxwT
418
Aristo Wiley
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrAehWoMoHYvgrVrRGa_Po4
685
Cherlyn Yaviera Chu
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo6E79i0fpyowCDrIXRTWc2
684
Chayden Yavier Chu
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo6zDFHlplf6a_Ickl8vmDt
566
Jollyn Felicia Wong
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVro59gJiwbWpaV-LMuPxrEe
442
Beatrys Vanesa Moiras
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVoNrM_YuzbZnCbeZUhf56mQ
534
Izzatun Nada Azzakiyah
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrEWF5Jydafv4K-DRSFw5G9
548
Fiona Candiof
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpJ8XKeFIat6bNMD971wtxy
577
Jovanna Wong
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVquhb48vsVEQQhOjzxbxME2
682
Jocelyn Ryu Kaylee
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVq8GvKC7nAHdsoUKHcRH5Jp
532
Yasmin Fadhila Azzakiyah
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoJbk0tgQM3RSO_x7sCbOwi
66
Ivaldo Juanda
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoLaqMugbC1WTAzp0JfEE9I
31
Hans Sozo Wu
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVp_SnlRu6m_IL_naBQm31wu
581
Nicholas Zheng
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVqhO6JsMTQEQ9zDH1bC5UJl
55
Justin Rusly
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVq2jIjyTtIfJCcD9_oHDd8w
379
Cathelyn Basirun
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqBjU5B0JU4WPf5YjctcpXs
576
Joanne Wong
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqSjLH8uW7Rno6UltuUIIBs
593
Houdrick Angelico
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpGOk9CeEJEg0elYqd-ikM2
580
Vivienne Zheng
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVpQpd6MOcV_sIBgDVOji1oi
594
Harleen Angelic
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVraDU3NmhVs84N1ROAF4oQO
301
Chloe Zhou
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrCWhTJWVFdEpXMMZkinsvL
396
Matthew Candiof
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo2bx4_0OmeM0Dq54Uz7vRn
30
Chris Yochanan Wu
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVq0g-vW7NmOwBNWLvHErnlv
573
Alvaro Richie Theus
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrrc0vDrUVHWx3Y6BRFJQEW
330
Avril Valerie Tjhe
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoF5eBCiBtJCjblaKoiBhUT
568
Carlista
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpq2WHyoqQmySk9vfPBoobS
43
Petra Zoe Khoman
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVphUvJS4wdfpi3DyZ50p78Z
54
Grisvian Tandy
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo3Z1myTorF0CSLNt70yvIH
65
Gelsey Megan Chaniya
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoAX3FE_dY4i9OusA4Oy7B6
67
Claryce Annabelle Yu
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrGIQbRRbaT8toj1Gm5ZdGj
51
Cedric Damon Yago
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr1Hv_reBxvkUb6j4VNJXhJ
49
Richmond Osyan Sudilan
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoZyJXnLR81BLC9WVl_gv_K
96
Hudson Fulviano Sentosa
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrUCdc2ltwCQdndNs2He563
137
Jovian Livio
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo8KNlNUVBVP4ysD3WcmBSq
320
Andrene Metta Leo
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo5786yAwDwpf3dZoufI-3b
342
Louiselynn Nurimba
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVq0qiQDCJtNKVKUNu5FDqD-
94
Flint Oliver
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpSmYY3QitGmFALHT-fd0Zk
574
Brandon Tiojaya
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpCOMSsGthjc3iRbGLDTOrr
551
Ryuichiro Leowardy
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVosug10ETJko3Qr_IpRMcQU
604
Hugo Viandi
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVrEVZmlkK3BNwfmniUJOK1s
255
Denzel Geraldo Wijaya
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo032hiTp8SKc2nBCh9Nbqx
490
Shane Ferrucio Lim
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrRUbweQzHZRzM6iC82W063
578
Marvel William
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoOAyZCSzrK34K3wd6pALM3
620
Sierra Conrad
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqWn6Oqp_k7wgyrDCRYx1zF
549
Clairine Kimberly
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqKB6C7iB50QQwWfOGH8hZS
625
Audrey Hartono Lee
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqWoyZ-n7_Pik9KL936JJLN
628
Heidi Mikaela Tenggara
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqPkZh2AYJHu57cep3mrMeQ
629
Joey Frederica Ang
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoxqMsBiKhq2V-MrdNAsQr0
634
Glory Esther Simanjuntak
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpL4zE4v8JAhUnuVU2z3067
641
Emily Audrie Pannata
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqSH3DbqaxSTpTStVmApLHx
639
Bianca Olivia Ruslie
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpyaqocJLChln6d8BVFEAcG
651
Ashley Claire Lorence
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrSAMwi6ApBJ9Fh2OgDKGIg
677
Olivia Florence Loesin
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoxAT4w--N93OPWX_VutjQ-
678
Zoey Fiona Loesin
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrIc8jY24co-xhpWM73tA6d
643
Bilson Nobleyu
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqGS3syFOs4EHChQ7pYPORp
673
Nathan Immanuel Winanto
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpKOTTv8TIkVciVAzB6e_ZV
668
Richelle Shiven
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqy2-Ab6ZPrCHhLZq6B9NMi
667
Khoo Kwang Chen
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo1vXMPr2zfgv8zZmgdyEEr
655
Euan Benson Pranoto
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpFar5grbCMnepatIgxmVml
662
Clayton Komar Kok
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrQL44mkiQ_gxpyoeXEsByT
649
Geraldine Caitriona Saimen
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVp1Oqd5ol2x7EFItFJIlKhA
698
Jason Maverick Tan
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVr1iS9eCEr-_uOr7GrubW-x
699
Audrey Pheng
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqhTOSWyIOfqvFOJjP8DQax
700
Galen Lawden
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrN8obpk7yVnrlF3pF6rL41
701
Louisya Nistriora Manalu
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrC3D3RTW6aAB_vv7C6YsCZ
702
Rayzellvion Edren Yie
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrvJ2O5NVW7Wg8H30KG2P9y
703
Stacy Kho
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo3oHeEKaR8an998jwuHvzs
704
Morgan Valentino Lowis
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVq3yLZRhAaY2Llsw25ZjOqp
705
Grace vania susanto
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqXWuHHMQhFX71j0f3rUGNm
706
William Arthur Tjuatja
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqO_36fkeCdDRS7Ca0OaoWu
708
Dixen Andersen
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpiQvo-3cokCST4BUB0ikG_
709
Winston Lawrence
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqihtEPJcVeMveKJyq6eBDX
710
Ethan Jae Ongko
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqt-Yk0z0j6GEVFBO5lva4N
711
Leon Walter Zhu
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVowbdhTU4W20O2dgmUA6nPG
712
Ilona Freya Zhu
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqDlV427lehN_q38YompCLG
713
Ferguson Gohardjo
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqE9y7fDhsULH7YdxwoArow
714
Delphine Adeline Bellinda
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpG4TyHSp-ILdquRN7LX1Eg
715
Ken Os Lim
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqviKv3smBypi6vPpv6WVBE
716
Chloe Vallerie Jie
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqbvqD4S6cx8E6peQyErpJG
717
Dmitri Meddef Njo
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpTIOQWgi2XQLnWvZE4TKxe
278
Clara Glory Xie
#N/A
https://www.youtube.com/playlist?list=PLmfta-_9FZVo3kxlJON2fkxCJ-6dd4Zfj
719
Davar Aly Harahap
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqVsegRXIKAXiTtwQoYjJ1C
720
James Richley Qiu
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpcUP57JdjA8Z1UCbChOVvW
721
Jarred Qiu
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrcFFG3TnFFgpaNHev8sh3S
722
Enzo Witton
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpzbfvzmVDeFei2yxV-YNZN
723
Jolin Rochelle Chen
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVowiUMcI1d4cdkVhI43R8hL
626
Alawi Ali Zumaini
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpsTOABigoWK-YCo7lQlXUC
726
RENZO TANAKA
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVp3Okpb6XAqN1BqOubKVmeL
727
Edeline Wisely
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoDZWv9SNG-oxqEShW6qdf7
728
VENAGNEISA VAN GRINSVEN
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqfIW_wD_7LbTsZH-kZI2Hp
729
Carissa Aurelia Wylie
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoYtajOToBjeAPKHa7nA9Op
730
Felice Edly Liauwin
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoIaG5DXjosaKLOHtSuszR2
731
Nicole Alicia Tan
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrhvePHS4xWUqiZQmYAGgI6
732
EDWARD LIU
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqhxafSpaRH1Yagh9BOLPcw
733
Anindya Iftitah Lubis
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo9TNLAoV2tbvImE2KrLE1P
734
Jillian Alessandra Tjhe
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVruLGlEtvRPfR9ERwR4xUE4
735
Kenward Melvern Djohan
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpjSOq2u3zLIr2-mPMDzGVZ
736
Kendrick Melvern Djohan
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrODhCoQfXRCSomf_YqRnK1
737
Zivanna Quenby Boey
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo-UzQ-P9QQFZ8GzxJYaS_6
738
Adeline Njo
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrcZbbzwTzykkK2w6SldQrB
740
AUBREE LISMAN
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVq0vmirgFRinkEosvizXIBJ
739
Zoefiker Putera Ngadiman
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqrh8Nj31DegGZGSFCb6YvJ
741
BRAYDEN LISMAN
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrxwIeX0T_x7C3SU1JRjyo-
740
AUBREE LISMAN
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVq0vmirgFRinkEosvizXIBJ
742
Zavelyn Marpauli
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVp8acRM85EKK5TcC6B1iYg5
743
Nathanael Shawn Alexander
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpSn3IcN0TC0TdrPuJAeeHj
744
Vianne Renata Lim
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVp4fAiEOigzTk7yaS9A67zj
745
Jesslyn
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqNSpCcIdc4y8c6bfyhI3kC
746
Jocelyn leman
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoVMWtCCpwKIbjwZEFE1zun
747
Jacklyn feliska hasan
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrjc-duZ73Q7yJWObbyLoRn
749
Jocelyn M Yasmine Parhusip
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoPmVmDW2sI1wV-LBII-ieg
753
Eugene Matthew
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrSAajjevuflOnrca57i57S
754
Reagan Khei Subroto
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqC9Fj1DjWe-XTXAJVPoldR
755
Sherly
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoIpPO3d2pZidsLYdBq2dS3
756
Callista
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpCDRKEXhVHtmIl4QN9L_RE
757
Jeanice Madeleine Kwok
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpvSEsmSsQAZo0CGnH93Ltm
758
Sofia Lukman
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrIfEoOzZU5MM97OFhiZP1-
762
Hogan Calixto Huang
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoqsQva1jcYwsZ2GpJr-R5v
763
Safira Reynia Hanum
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoqO0_Jq6yziCfHRSn8SogK
766
Frincelia Wijaya
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpILzKCghw5hwEkJ-g1e6r0
767
Theodore Joachim Wihardjo
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqrFpf6RGUGQISFwCRDsqkO
769
Joyce Yang
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVokiB6o71WCloXynhRPge1H
770
Emma Gozali
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpp6_R91AaH4TcEH2CtY6-_
776
Eason Niklaus
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoPrzdzDAXc4n5VLNR7plqR
775
Clarissa Amberlyn
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrcyDD1x5QHdS6uYItHEzUt
772
Joleen Chen
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpkKSzvTjYWOFWOrnuOihur
771
Jileen Chen
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrm-kyFd0Rf8h0SywH-VnDI
777
Audrey Victoria Lim
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVomywYfKuhpe6FKL6Rb48ll
778
Christian Beryl Sinuhaji
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrHW4_ENOQSI98-6CWXSsJl
779
Jayden Tarmidi
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVptXslT7S5wfi1TFZvTALa_
780
Steven Nicholas Halim
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoPQQuZUHolZIraFNLhYCRP
782
Hana Sophia Alice
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVr4Xcokea25b1SUp5UCz5HA
781
Savannah Zoe Wijaya
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoOcUQbTRH25naUOG8I0ztv
783
Evelynn Lee
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrQv4YjuWrbrM76ID7liXtz
785
Kelly Alyse Tanary
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrvhONCbCucWP0PKxafMgD4
786
Shelline Sutanto
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpVBnyzG2j7Pk-x9YPn0M6U
787
Shahnaz Shirendia
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrBEm3vBDrjE6A9pDnK6PXq
788
Mhd Farid Athallah Hasibuan
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrCrsSYqbg7kKMiTz23CMD6
790
Hardey Moeldoko Law
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVq7iBfmrjCyGjyB04h1MUJB
791
Eduardo xaviero bingei
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoKWLefQ2o7ROLk_jjlskrF
792
Hubert Bryan
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVocDEyvLYFvm-TVzjuyjdXt
793
Grace Kelly
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo00Qj6yJF3ZU2-folNQdjv
794
Judyth Annabelle Naulibasa
Expired
https://youtube.com/playlist?list=PLmfta-_9FZVoaWHj7v8jtiKow3d15ZW6L&si=3AwPKDkxBQgXhXVR
795
Avelynn Wijaya
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrWQIin8NGbROpXlKFGuj57
796
Ashton Howie
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpBoKA3j5H3AcVdra8Xn3db
799
Meredith Adlian
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpwW9WtbFIMUpkxqfb76xmx
800
Xavier Orlando Boe
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpO_Q9dU5y1Z56MX6QWzonV
801
Hillary Calista Tamado Panjaitan
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr0gOeDtzHY6Y82UONEwlt9
802
Arthur Kendrick Zhuang
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrP37ZXDNDgezg9Eubeb-wd
803
Lovea Fendy Kho
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqtaYEq_oxXVdUihfo__DuA
804
Rebecca Iewanto Xu
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqKarwt9Ayy9ATFPx7yvTvm
805
Jevan Sean Vertio
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoG23K3a0kTBZeTHM_Y43d9
806
Efrata Iskandar Liunardi
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrHe1RheH25zd1YhnP1dTek
807
Tristan Jacob
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqsjzieH76NuKmBWaD2nJns
808
Gareth Brilliant Lim
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoxsKKTZ6ZbSu8on0kd0bVg
809
Emilia Niko Nyoman
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVqsTCRkY_tOY-eqHl9uRhfh
810
Jayden Tanadin
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrbupfnjPBnRzzogTk7bcE-
811
Arthur Floyd Salim
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrnjsTcAcwZsLHjCOzIvDCY
812
Lorenzo Margo Jap
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrPKtGbahDxCBD61egzeT_S
813
Kimmy Tjanaka
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVq9H-Zfnwa8-gGE_tNylJzU
814
Navarro Lim
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrp1ml3qeQYXQL8iJaaPTTA
815
Alicia Oranie Depari
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVq9qwGQajO3yaO5knnLMILU
816
VICTORIA ALBERTA ZHENG
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVptkg-quZhEw83CMnrSyxpW
817
Nicho Chandra Vimalanetra
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVq2iByrTBLvBhh-u7H3F6Jc
818
Naomi Alexis Supangat
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqOPXOCR4fTpqNlAkd0klAf
819
MARIA JILL LUMBANTORUAN
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo6-miRsLP2gyHlTiVYiW9U
820
Alexander Alberta Zheng
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqGZNDO91XMt8bfs4GBr8Vy
821
Vallerio
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqPuw1A4ScgUSwICBOoaP2r
822
Clarissa Olivia Anne Lammora Panjaitan
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrXz8IVRrZFXPJdP8_4oal9
823
James Bryan Tantono
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpnX9gxhPaAyizQbaLpEpl6
824
Septiana Katelyn Sharon Sinaga
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoHnS-1aNzt-L9dpFz5CRy8
825
Grace Elizabeth
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqUzcNEGnK9Qxuc0DMJK2ux
826
Darren Wilson
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqkQmch7HPUiOxt5DYXKH3e
827
Aldrich Reynard Atmadi
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo216Flvuig0hY09NL7vvam
828
Elvano Reynard Atmadi
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqUFeIpzResnlMcnqxeHW17
829
Zhafir Gantari
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpovgMIJX427JMXJdYwuRG-
830
Justin Junior
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVp66Qc335_EH2bjMbGHyl_d
831
Ryan Hugo Purnomo
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVprPZi2FZO-sFuLb07Rnht8
832
Allessandra J Lee
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqhnG_lsL4y6S4yayygB93o
833
Quin Adrianna
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVomPPmm_1KS9diKqdSSGgR2
834
Mario Charlie
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrtEIazJrMSxzT6PVs5am6U
835
Finn Aldrich Luman
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo524lhbd6U-ppE5rzL1Gec
836
Kent Arthur Luman
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqkIOEhhJdB5Gs9s4vcfj8e
837
Clairine Angela Indrajaya
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrJKgiY7R7-DHDIbPkvun_E
838
Louis Harvey Soesanto
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpV-nudjdEZK6TfKOVeaNS5
839
Caitlyn Bianca Tjiaman
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpcRdEjHgUGrixcTS-j-cE-
840
Cullen Brian Tjiaman
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVq7fx0e0LeQj4EZwsjuGDVN
841
Jocelyn Jolie Tainiady
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVprSvFWdETPNnpKxkUrvv85
842
Ethan Moeritz
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqpFpI1cG5M-Q1mYi7fQ_ZS
843
Jenessa Effendy
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpBq2kL9oxl1Pwascn16YDW
844
Callista Stacy Lim
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVr1jR1EWh33tCn4XeTBRlyI
845
Wallace Evencio
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVpKc-D8tXkniNoME1VmwRZg
846
Stevaldo Verino Oursun
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoAHn1poIFqLddfnq3f6dl9
847
Claudia Catherine
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrbHb1Gq07gc8ekz7AHp7Zm
848
Ethan Fernandez Yap
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqQW81VMtBnlWqYzXwXr63A
849
Wilbert Limin
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpsaUhds1szwrCM6y8pIzo0
850
Karin Destynsia
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVpvjFuW6iuthnabYqlscuGN
851
Tiffany Taniwan
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoScmxJnCykjS43c8kSGYQG
852
Cellistia Cangdiago
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVrsj1UukBP9k3mjGp1J3tqe
854
Chiara Vallerie Jie
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpg_hA3YvMApsfcN0CHL0O0
855
Cayden Louis Auwrich
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr-5Joh21qJBw_n6J37H-oj
856
Carissa Catherine
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpIHCDMVF-5SW2KnuqQTl2O
857
Hogan Chan
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrIStqA60Sc7cO3P1pMH3AF
858
Delmond Osyan Sudilan
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpjUgZlrkGJZfe9KF1WzNZG
859
Clarissa Kho
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrIjUopVmMnK0N1tsCX-82m
860
Michelle Yap
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpmAe3fD-DM6tlbF7fpKzaf
861
Cyndi Ramaly
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVr0juDqNMa3Mpxm4iCwd78r
862
Calvin Ramaly
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpkN9yL8Ec_zewT0t_GekVv
863
Bonita Gaudeti Sinaga
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVowF0mTQSW5RjCwefFX8u4U
865
Victoria Yap
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrDAZh9nE8_PnPYrRN5FUS7
866
Carlsen Simen
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpjbt3DRrQJ_V4z6RCWEPwT
867
Cherlyn Simen
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqk6TMqD0oZweETHWDRIPBU
868
Sergio Garcia Ang
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrujuCPTfYefLpSHknewH9K
869
Fleurette Celestine Lee
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrLBsup4XPigJ_miwOZlRs_
870
Karen Hazel Liu
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVreCoAyXje9XHp96WytrMKm
871
Ryant Anthoney Lim
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqdS5AfxdQfYGbwOEREDCXP
872
Kenneth Samuel Lim
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVp-ISedNZw8NE_uzNCk6jsn
873
Ozil Ramadhan Hutasuhut
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoFkHUnny_2XVy8dHgfXBKY
874
Muhammad Rafli Arkan
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrJfNrmrFIZNiIzMc_p-0WO
876
Jacqueline Vallerie Chen
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVobdVRQXl50aj0cw8PmYA0V
877
Jenica Zealand Feng
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqtn0WuAB9H8D_RqCI7zhzn
878
Bianca Maldiva Feng
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqZqY45CI7ZaDbMMT1yOv0W
879
Jolin Vander Cia
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoCqWaB9KYKpxG9VoefFySG
880
Joel Edward
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVqPsfdOA-fxYQ1Zrwcdg6Fu
882
Justin Chen
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo_hz41pLHRhTO3B-npCx5p
883
Joanne Lynch
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpWIgCi9QmVRwNUy4ZXynGP
884
Starley Valero Gozali
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpgwm2kn405Gj6bGdflnEPH
885
Skylar Valdesto Gozali
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoneJsqJnSD8wrNgIYU73x3
886
Jazzlyn Javeni
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpXJK-oG9tJnom1w7ZsdULr
887
Filia Cielo Lim
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpPEAK6KG8jqRL0qheoOcEZ
784
Garrix Ardent Putra
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqHvIhKaMeDCX8Eh6vPj2ie
888
Celine Chastine Angkasa
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoXgCJgfZDQngzqGV-YEG8F
889
Madelyn Odelia Lowis
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVomHDBdipUacON-frDOwrkm
890
Eunice Grace
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrzARKZ4TuJSY-hXr-2uOHh
891
Jayxvier Keegan Chuwardi
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVop2BC1pg1bj215GURu-lpM
892
Edward Nursalim
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpWNOp81s5TeLZ4UuvaWxKX
893
Prajna Nursalim
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVozWzLYTnWwKXOSV0hTeCWF
894
Sudatta Nursalim
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVprjEMcCT3-x9e75aclVgqn
895
Michelle Angelina Yip
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVr7vbBs5U1wA27XPz6d5jts
896
Nicolas Carlie Kuwira
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqSPEVEsZZQbKoYNqGgObcw
897
Valerie Ivana Chen
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqzTmH5AhhONpwiofxjtzvn
898
Ricson Stanlay
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpb3Hu8ZetWISUH7Mcl5Fl2
899
Jay Ven
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVouXA5IQTi9EvXE22WnHXxr
900
Nicole Carmen Chang
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpTZN1OEjwXE9NJyw9RQZAv
901
Elaine Velicia
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqshv94kkSChUQuazEvUoZh
902
Malcolm
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVprc4MVS6KJLHnxrKTywHl1
903
Harvey Oliver Lee
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoHCQFfTu40IVLDpElt_agW
904
Callista Aurelia Tasma
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoWd9LxiGOcF6brUTRy8j9i
905
Carissa Aurelia Tasma
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqaq9qrS_ctSg9i2u_Xo6Ly
906
Dario Oscar Zhong
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoxupeJDb_qOrDzmmJqNDMF
751
Howie Chan
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqr4FGwg1RICr94NsdUuHdw
907
Emma Valerie Pang
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoyBYCF0qzsFlXXZ47O4ZdP
908
Averynn Marcia Pang
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVp0hyKukDDGDX5PfPNe8MnF
909
Keona Jaileynn Lawrence
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrSt4O5RaZ1W8UFFzjO6E4r
910
Michael Thamida
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoZgEj2weK3qBBh142GRQrD
911
Meivellynn Thamida
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrpVFFNa57diIHPP9y-JQN2
912
Alfred Benyamin Leidin
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVokqhjD8q-Ju8UJT0FkFcVg
913
Roselie Kirana Wijaya
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqRZ_9_p8Hgt7JbzkkexcOr
302
Eduardo Bingei
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpa-leJ4BH3cUTVpUg2F3Ta
375
Darren Gabriel
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpYSg8z6EErU3PUcfJm-o71
546
Adelynne
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqYbbqbtU1CcztlcYeHrfE_
759
Warren Emanuel
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrDKIPE30zedRjtDqM_qvEX
760
Richard Zheng
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVq9jOONxYG9CSUu34Vruoao
761
Richelle Zheng
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVprmvpiurupUS9quOU0mSCl
768
Josh Seravino Zhang
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpwodkfMguHGW30Gl0AVKf-
914
Leia Kaytlyn Tioe
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVpaINcsBGuzQBPcoTp8dIYm
915
Rachel Darlyn Udjaja
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpv9_RAWdw8PddRwKluQTGW
916
Valentino Nauli Basa
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVr5ypdUIYqMJRPerqCUHxq5
917
Harlex Tjengdekia
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVr-EOKQff59Ebeprwmy6hzd
918
Fayee Abqaira Putrigian Sinambela
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVq2Lz1y7d_ov8f88QUy8PeV
922
Victoria Cenata
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqYTRi2_S_Mu0262DMPrrpq
924
Ethan Elka Suyento
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqoQA6G9dmjcSk5nx3FF36S
925
Quinn Felicia Foo
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVodMvcLHydPWpT02tbYeJQs
926
Arthur Ignatius Carrari
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpiwWNRfR--o7_ct9I_M_zm
927
Richela Stanlay
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrk2OmgzKOkGb7TTCkqekzx
928
Victoria Roesli
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVq_bnrsrFiCx-s9bYUgo4zZ
929
Trevor Hartono Lee
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo2kM8UtSr6jGPIBxTfd7M3
930
Celine Nichola Xie
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrxeUm_VkrWIQIUZjojWBGr
931
Zealand Charvi Nathang
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrLMc4y_UlVgk-beFqDnAeq
932
Olivia Tjoa
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqy1D4JGKd4t5JsnYUfznHs
933
Ivy Jeane Chanella
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoC2TikUmigNec1AFlcntEl
934
Zac Anthony Chua
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrNoQmq_YdnBMlb0VHL7b5h
935
Gisella Nyoto
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVov5OnnWMDTVDkRG0YgrETl
937
Jillian Claire Kuanrius
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpTUNiIEC5jEZyHciimv0tz
938
Reagan Nyoto
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrwIctdFJkQoZV2pWx5UeNp
939
Rexcaden Jazper Shu
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVousjqE_73LxNRWbgyWZ4ZW
942
Elaine Viandi
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrmXsYLcgZ6x2bOo-__O53B
944
Kent Aldrich Huang
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrZzCjDIO5rIq0E2dOKEyd8
945
Angeline Felice Theo
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrH1n80OYVgAdLhk--YJdts
946
Ryufin Junus
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoUzn7jw5ByzS5hYhsMDYiZ
947
Nayyara Ayaskara Prakasita
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVoKfQGlVJhXhKwFXsUgRZMf
948
Erick Winner Teo
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqSJhgx1FzvxFQAXY6lUdww
949
Amelia Irawan
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVq3NtE57mRIrrAIvbE28hn0
950
Audrey Madison Loewe
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr4kl9T0hqTcJY-rCsnnol8
951
Mavin Jericho Phen
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVosB_Ua5DjMFitgb9NAbKba
952
Louis Alvaro Wang
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrhyrs31Z2tMsSgia8Btym6
953
Chloe Valencia Wang
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpZoQ9Qt-46LPpfjiCAA4mL
954
Ammiel Malikha Lamria
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrQOhWY2OZhb-GdIDJ1aGj5
955
Naomi Grace Edward
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrGo20g_28wXf0iivL5tZ8m
956
Aileen Sophie Kesuma
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqkAcAOeYEY3PN2aulHn8dg
957
Rafifa Aisha Mahira
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoW3PMo4iuDy0qGzg97Dy-F
958
Raisya Putri Raharjo
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo3xe5eXmma1Qz5LzsgObrv
959
Aleyna Chandra
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqiNHlP02o-S6p6z4TI6vuE
962
Ananda Putera Ngadiman
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpFaP_AhS1Q9VOEdE52Qouv
963
Yasmina Athirah Rifqi
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoNdLlYg9CksBaa5E7JKHwA
964
Yazeed Abizar Rifqi
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqnE_iWP5xC6l9viDJlRwyl
965
Modric Agusta Daruma
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVp3ZJJTgz4qTJEyEm4oib-p
967
Eko Suherlim
https://www.youtube.com/playlist?list=PLmfta-_9FZVpRY1u5gDTh60YE-k6lMxMo
969
Lady Valery Sinambela
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqPT5a5Z5tWp9j3PFV3D6rH
970
Jordan Keegan
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpE26QAW7sHE0NBukhsx4qd
971
Annabela Himeko Winarta
https://www.youtube.com/playlist?list=PLmfta-_9FZVoPA-O6m8zmGhaIzgrd5RgM
973
Darren Javier Wu
https://www.youtube.com/playlist?list=PLmfta-_9FZVpmFRpY08EAVvnDWa8OMvgl
977
Micha Belle Tan
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoF62MPiJuFu_1SaGCb_nWP
978
Clara Jill Valerie
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrPr4IREu1bUSziKAMmtdxZ
980
Ezio Lim
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrICsS5hUnkHleRCeFHyv98
981
Joey Milan Phen
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVocbRcCB5p_5N_v3xHPGmAc
982
Abigail Hazel Tamin
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpqc_9VyV40OSvXTLnu9_tS
983
Jashton Tokyo
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo0QxVchRTOEWXV7C-H4ksx
984
Chaden Ettienne Halim
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVpRpdGxB-bmdxFFz-sud0Xt
986
Jason Allen Tjoa
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqWS7nmkJ2TO-cF1OzXn6dO
987
Caren Pandiago
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpkC8BP2V6zhUT8kb9Br3Os
988
Gavyn Wijaya
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr0-9Jq2pOEGvDv3psjNyay
989
Federico Fredelyn Jeoh
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpHeKrcyJywnR7oZyhMF5IV
990
Zason Riady Ko
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVqflfTU-cJJ6Ry-7KAJlP35
991
Arya Kho
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoLCWlaRuHAWTR4DBnaUxta
992
James Ananda Wijaya
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpia-ocFz5S1uL-QfC_T99T
993
Miranda Belle Tan
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrJiRk98TWyoLyPUMgdcygh
994
Valisha Sofi Tjandra
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqwj1KOS4158oK1pLd9zfLu
995
Qori Putri Syahviah
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrfubVDWJ9yHSYqQZNaUcU-
996
Venesia Anggini Purba
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqKWh2_24BqxQQKe-XoTsAU
997
Jovin Limcoln
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrRzKS9l2BMf2YiMEyXd01G
998
Fedrick Wijaya
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrYnT1sVO0OEiVhzrbKOZds
999
Annabelle Grace Wu
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqyUAIbMNC5jgmbbOw1Ah7Q
1000
Chloe Sinjaya
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVr6M7h2FvLm-6Md-S6Yr1mp
1001
Hanson Nicolas Chandra
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo93JBWxQ6QJse9mw9ur64V
1002
Hubert Ulrich Tan
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqThkHQ8tOjjHKngZogbECV
1003
Arthur Alexander Hakim
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVp2v3hbL9etrtfngYmqC56Y
1004
Vederrick Ethan Jap
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqQ91blk_PTZdMokh9CmwvA
1005
Gisella
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqwR7X6-ewih0Aeah_FNaWC
1006
Jerico
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVr2boy8TYNLUeQDR1jeEHQ8
1007
Davina Grace Ong
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVrLEXT1HaOuARXY5RN6fDw-
1008
Sydney Princessa Lim
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVqiOI1OBoi4B6YF12_E3hYN
1009
Felicia Grace Ong
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVo7tefNEdD4mxyLGn-3Qp5d
1010
Gracielle Grace Ong
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVpX7ykYIrMvZRGQljRm1NcD
1011
Clarence
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpPmjyUaryd9pMutHgluHTo
1012
Clarence Aurelia Colim
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrLKoDtbIyRzvfqLkBoje2z
1013
Michelle Kalyani
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqjcusx5OOvUcphyLfCvufn
1014
Catherine Gotami
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqR4ppCZaSjZacDZq7ksFOU
1015
Fransisca
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqdPnvQtf9K9_zVPebdkofg
1017
Harvardo Lovenzo Susanto
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqfRLndBOwW1FLaPILfHR1_
1018
Freddy Salim
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoxli1uVg09yJo49hMgLdgM
1019
Louis Clinton Chai
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo1zea_TflfMkoQySU-F7Kc
1020
Caren Axella Natania Lumbantoruan
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVokkbeTgqHPuTfKAEuitm8U
1022
Efraim Lucas Dimitri
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVpPsd5tBipuvSssIqX_jy9M
1023
Darryl Raynold Leowe
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpYE03-Qj5AwUPPWofzeY-N
1024
Chloe Audrey Chen
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpKR-KMaMm59rz0TrlGd1XO
1025
Hermione Lovely Susanto
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqhk92TziPmpEREun2BqdF0
1026
Angelina Novita Chandra
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqJnmGbDyRIzVaZa4mMtdu0
1027
Elnino Jehanra Saragih
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoJGU3s7vHqwCUA5LyXDJCo
1028
Darren Winston
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrMf168qSFX0MMr_TYj6n16
1034
Cherryl Riquelme Potan
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVoQgx-wwNp0wsEPhQ3cnYib
1029
Luna Antoinette Linne
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoo5jN9aOoH38dv2mLDcIPG
1030
Valerie Rosalyn Yap
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVplkMfL1LxTxwKjbgD8FueX
1031
Jacques Lewinsky
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqHwfu-SzbG-OIf3C1m9YeC
1032
Joey Celine
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrz2EZ_2eFBvOlyS7hEDGEs
1033
Shelvina Howie
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVqLDzx6WYiMJdqRAjVpM_AS
1035
Adeline Luhur
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpSiRiA12DRr1-Y25DzrM3h
1036
Verencia Alden
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVp2git9xszXTV_Rvg_xIjEm
1037
Caitlyn Allison Yaphen
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqXCpU0rsKDDl0eKdRsnMXU
1038
Devon Jau
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVqCpgdAMRJd8ahBS7kVa7v-
1039
Naafa Maisyva Ginting
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpjKwIvFAvuF_dbsOjYP-av
1040
Shane Anastasya Kristy Simangunsong
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVolAKLA0GSTOGiBHP54Prsh
1041
Chloe Taydey
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVpynXI5wuy_d2ryVYX0U9NK
1042
Maydelyn Zhang
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVp0EmYkj67ne9MgrYXvanC5
1043
Kenrich Thantio Yangderson
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrA32IYwMHaSegEC_iOTyTJ
1044
Dominic Kie
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVpoxcBoVBpJ8GdZV9NhvY0g
1045
Silvario Soedidjo
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVqLFUpw98yN_dd4M94rgjKI
1046
Max Wayne Subroto
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqBYZCFKUoUCRQcOU5MVU90
1047
Jordan Tanutama
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVp3mfl4OtsQTPunii2f_nMX
1048
Reynard Lis
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo8M9hWn3MeDitVopKWXB0Y
1049
Rafael Maximillian Sitorus
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVp1zGUou7IosofsSIdTXxck
1050
Galang Roland Besch
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVqCznWyn0BFjGIvehG7kEzQ
1051
Timothy Anwi Panca
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqoXHNysevSPGV3kniAryoO
1052
Carlene Yang
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoVMZkw_rOtwdjix4xxj_34
1053
Elaine Clemence Annabell
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVpv8QIn3j5ISM6m5ZtPI1VQ
1054
Renata Allie Rusli
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoJRZj_LEQadJL9s5KegdUy
1055
Reginald Ali Rusli
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrfVVJW7mtpvLoJlSec5fng
1056
Yeslin Yap
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVpLL0GrAgq892J9fQcyQIvJ
1057
Louis Xavier Leonardi
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo46fhmk4GbSYBsrr8_tc64
1058
Gracia Tiffany Susanto
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVp-DaLQW8xzV2llmXcRUQWH
1059
Meuthia Gadiza
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoQms_tt7h_2pF3YoZOJrL4
1060
Zac Aldrich Mayor
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrysbbPJaDJHfG1SsVOT5_Z
1061
Kayden Skylar Sanso
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpLlKH-PbCOLWPCo4RasVaC
1062
Queensya Lovely Reya
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVoY7bJ5BmVvu_XDqgHtQliN
1063
Nicole Beh
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVq0acOd7IFTVsqrDi2fHcGW
1064
Morgan Beh
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVou0MTIolD830kSBvqs-LTp
1065
Maxwell Louis Jaya
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqUVRMXZl8zVAhUlk_F6FXC
1066
Samuel Christopher Halim
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpjTQd9RQnrMsDZ5CKttyZn
1067
Richester Casvio Liong
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoz-Yl6eyGvIYMjmynGiUuR
1068
Hiero Haydenzo Huang
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqQpc_wXf2Zn5slFeHG9285
1069
Kartrine Sathya Felim
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVp9fgKnUUqfo3RihCZLKO69
1070
Krishna Dhammo Felim
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpoj2FH4bWva5RPtDhRxFa0
1071
Chloe Aurelia Ten
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqXqHQc6Y3ofWYVoeEEL9VS
1072
Hazel Natalie Ten
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqCLz3KBxXlWeX-vESi6Hc5
1073
Scarlett Avery Ten
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqMmmq6HlurvXG-lcNhnnVr
1074
Ayska Najya Prakasita
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqzhDltLC5-8VVRXEV3tvq3
1075
Bryan Michael Ng
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpVjbd7w2OU4Tar-xjQfKc-
1076
Brayden Matthew Ng
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqrlzb79qBg_hQG0R5mS7ar
1077
Alqueenza Syifa Winona
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVp1JYJ5_xDEIcDa9hMPGiUj
1078
Ethan Kenny Daruma
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrkbY-f-JDrX_opXRIWXcq7
1079
Keigo Kusuno Soh
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqZOa26YFuwZ2DYEonLa6kL
1080
Reynara Amber Koiman
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVobLXFYf4m9sonbjt5djpGF
285
Clairine Joshanley
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVp6oD4Nd9RKXlpvn2zYRV0f
1081
Carlton Kho
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqn3mZKZN36oq3OgW_Ennmb
1082
Davin Obert Khoo
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrIMZzaM9x3ZoaZm0_D_T6C
1083
Gillian Alexa Pearl
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpxROyratXsc7b7YltTE6vx
1084
Leonard Nyoto
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoaUiaMR1WCHX5XcHsq1QUQ
1085
Garent Nyoto
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpuqt2sGcAXiikVy9ccod9g
1086
Kayden Ethan Zhou
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpbExdy6DNtD7m-TKOHYGiC
1087
Nicole Eunice Lautan
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpnVgvlKWIe7LYc6Ek1XtgU
1088
Alesha Sofia Andhika
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrBvexBrZBCRDcR6KB-wrio
1089
Jessica Jo
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVp3dlXK4vGz-X72lEqSxGCr
1090
Healey Tjoe
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqMHhlww6YijtffCqGP1Hdf
1091
Jennifer Othniella Situmorang
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoxH-2PclQ3kftS4_qyk_ia
1092
Jill Madison Ali
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrCRlDaUEeflxriSyMEEUH0
1093
Annastasia Hideko Winarta
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVp0ivXptdhlIogI5chDxaH9
1094
Howard Richer Thia
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpcOeL6wFhsIJgsl0UpHV1p
1096
Maxwell Kenson Wibisono
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrcst971rWVGA82a7g4DL8a
1097
Reia Rose Winfield
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoyxKCl6pDnxNbF4-pREXV8
1098
Naia Sydney Winfield
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpFOf_ohNEecV_lQQwAc4vc
1099
Cleva Levica
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrwNb-_5bXjxo9lvyr8-2jJ
1100
Khansa Salsabila
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrvf4qv4k1x2rM8FGwMA79X
1101
Fredella Alexa Maranggi Siregar
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpaNg-XsmLiNtDeTEJBq3Fc
1102
Adhyasta William Nugroho
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVrP67RB3lo8Utt8Xv113PCR
1103
Nicholas Tjin
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVq1gZGFjFls92c9_OCrAwUg
1104
Abbygael Mikaela Tangelyn
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqffj8j43YcppxpCMEAT3XZ
1105
Keiko Aiby Lim
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrI80CW-Vm08ejkxUC6tcd8
1106
Vierra Cleevany Ryu
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoEg0piCTv6-FYiN95QVq1j
1107
Gwyneth Louisa Yap
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpztIp0uZOXEA3X0EY8QoMn
1108
Zea Alesha Rizki
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqKazBfMAo4J8Ejoah1JgJK
1109
Princess Latheefa Azzura
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo2OFeiQvjMfL9ZVYnoRSck
1110
Aaron Yang
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoQUTHVlYjGVRJ1Q8olq4mN
1111
Howie Leonard Wijaya
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVofUHCBiEcJM-jntLMOqkFM
1112
Maynard Jeremiah Simarmata
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqbYvyN5etSVbjyQOHJvIsu
1113
Joe Benedict Japto
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrT78EBMM-lEneHJfzweOvH
1114
James Tjoa
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVraQylKZQs4l06sa_2LHRXv
1115
Reagan Oliver Zhuang
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVp8aMwOLYdw2OFpOumghCf5
1116
Kim Megumi
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqNHwuEifgPTWVvNPkC8JxH
1117
Claire Gabrielle Oscar
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpN4kOQUPm6ZHix-g2Pdvz0
1118
Reagan Thierry Wijaya
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo_WxjK23B_feXBIL8ds_zs
1119
Andrea Dimitri Ashraafi Lazzaroni
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqBAPtzyvBtSVboIjh0sZkp
1120
Reynand Wijaya
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo8xe4O2J_4_0LrB9ELeJmU
1121
Liam John Rickson
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrZiNhm5Mk4b5a4N_5FAtDP
1122
Leeanne Jane Lim
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo9yiqfD7t919ZgMqRWAv0W
1123
Joequinn Felysse Warsono
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVrbnBXZOVTdG1OAG1e8zu1y
1124
Felicia Liangso
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrKzHEhvP9VucJR7-NpvTuY
1125
Grace Anastasia Zeng
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpvP7PpQsIIezLlax4_bXAZ
1126
Yedidyah Mikaela Erina
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrLGzaFuaHJwX1LtyOibns3
1127
Edric Luiz Ongka
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo6H57T5voGzMx4UD9uWwqL
1128
Lashira Awbinsriee Pane
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqCUp3ht0D0jtkTyZWiKw9o
1129
Stephanie Evelyn Luo
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrYxfGl6it5b5mE-UKxnbd4
1130
Ethan Ray Maxwell
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoH8rzf2gfFGLBTTf-Qonta
1131
Vinxiero Carrick Francoiz
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVojVFwbUzfSmbI3wBEuajan
1132
Nicole Lee
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpKLSoeyLRtiluXH6U3d910
1133
Natalie Willeen Zhang
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVoTj_Uq4vKjaMBXtRXZ1776
1134
Kent Nanda Daruma
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVo7IOPaO8qqT7ZBhJ4djDDY
1135
Cherysse Auryn Khobert
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVovjhEB1VKy9_tKdNj4GWVX
1136
Ernesto Zedden Wirawan
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVov_LSj9WrCoFid7OgOrX8F
1137
Celine Angeline Yiandri
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVopG99ufsk_cMxw1C8V4rtZ
1138
Mike Louis Wijaya
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVosdelaLs4Vd_BXwyRxN21z
1139
Wilbert Wijaya
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo8jcQKSC3dyJtbFHXjJuT6
1140
Keita Raelyn Deng
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrGSZede7Iqh0Gk1smLqlFg
1141
Joyce Nathania Shen
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoh9biflm4krTNZQBn5WREM
1142
Oscar Linwood
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVockYSshY178jYjxGxPn-UW
1143
Rico Alvaro Chandra
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrGZ2ErCpxwv8rI39LyKET9
1144
Kayla Shilyn Gani
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqV2MY-17j54Tzy4fwsmMYx
1145
Gallen Yuman King
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVppHmmnJ89w8SgDxt-IR8PT
1146
Charis Yafa Tobing
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpLuYAwOvbaOFw3yhlzkJno
1147
Calista Kasih Aprilia Harahap
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoXkFqi217hh2QsL5BQYLVl
1148
Talysha Sri Nayla
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo327t9H6W0OC-odIZPNZJW
1149
Arnold Alexander Hakim
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpNjhflxqU6N63kmdtVE0ME
1150
Kellyn Chandra
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpIDlYDD2kjQy5ZMNKdw8vL
1151
Theona Zefanya Purba
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqj3pZhLOyn5jSxViJBlvBX
1152
Javerson Joshua Tobing
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVq7RuyUY0u2OuczcnghPNi-
1154
Aca Raymond Tjemerlang
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrmF9qppz_FYVPP8h0L_d9J
1155
Howard Winston Louis
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo5VC1742uTIpz2EgulFPm9
1156
Alika Zelmira Wibowo
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqn7VZGO_epEI9_DCnd-hZ4
1157
Gywen Stefanie Wiley
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVofArrZe5kyrzSdaGPC0oRi
1158
Kendrick Eoghan
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpUgfkqUgA-o2VsA48wbblk
1159
Kezia Zenitha Sinaga
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVp1YKC10c29XlhES_wqU7c-
1160
Karen Kallenia Sinaga
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr0t0ELXPRZWRMIN99r9449
1161
Randa Miracle Boasly Sihombing
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVomsrkwj2G5QvwYf_R91okR
1162
Carine Susanto Lie
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr7hEBIDAZJQmun-Hn8TO2W
1163
Azarine Apriza Darmawan
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrZWMPdXq6xAU4FXHECVqdH
1164
Felicia Ivana Silalahi
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVphIAlJCizp6X_nIzH_Htec
149
Elaine Velicia
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVqshv94kkSChUQuazEvUoZh
968
Lady Valery Sinambela
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqPT5a5Z5tWp9j3PFV3D6rH
1165
Madeline Lauren
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrr3mJ5BupgVJ8nsz9XCI7D
1166
Anderson Putra Supama
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpNyLTIvQoak67KZthQhCaL
1167
Fredericka Sigalingging
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVp52Qn_Rx76YxezdrnKuPrw
1168
Viorencia Tantana
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoOAR1K2eQApTyop9fUv_B1
1169
Gisellene Lowisuri
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVp737_RNTv7nP05IZbqvcHj
1170
Kaylynn Zhanghoven
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqStZQVhHN2Es2iCVfotX6b
1171
Angelina Cenata
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrJPqJl6X6GeKCQl9MrrI6S
27
Valerie Legolas Cen
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrj3UcsH4RLwVtZfgDCINt5
1172
Ferdian Zulkarnain
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVp3jVotybUqqCdL5v79opti
1173
Mia Emily Soeripin
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqJ-hJfhQsIPShxK4cjGptk
1174
Vivienne Claire Soeripin
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpZBq6JWGqR29pePanMRgDe
1175
Vingeline Chelsealya Angkasa
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoFKvRQUeZpkZ8n2k8Fk-d6
1176
Jean Catherine Anneliese Sebayang
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqnCCXvqMV8rDl-ti3wSM5z
1177
James Edward Lie
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoC7DSlVht8GriHrlw7Unh0
1178
Richeline Huang
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVquzGNFXKFpxvjqzQkGeLov
1179
Livi Celia Lim
Active
https://www.youtube.com/playlist?list=PLCBkXH0IH0FI
1180
Hariwell
Active
https://www.youtube.com/playlist?list=PLcAk5E1-3tlU
1181
Azzam Al Vanka
Active
https://www.youtube.com/playlist?list=PLZLXCaz-LCEQ
1182
Stella Wijaya
Active
https://www.youtube.com/playlist?list=PLZiogp_-jxCU
1183
Maxwell Utomo
Active
https://www.youtube.com/playlist?list=PLJ8zDHs7snlM
1184
Louis Sinclair Zuary
Active
https://www.youtube.com/playlist?list=PLM5pHAGladoo
1185
Genovia Grace Widjaja
Active
https://www.youtube.com/playlist?list=PLKhypur3tPPo
1186
Ray Yudhistira Ng
Active
https://www.youtube.com/playlist?list=PLBq6_6uzrnXU
1187
Michelle Aurelia Chen
Active
https://www.youtube.com/playlist?list=PLS664dfYCN_I
1188
James Oliver Coaca
Active
https://www.youtube.com/playlist?list=PLaIHm7lorTQs
1189
Kennan Eito Shankara
Active
https://www.youtube.com/playlist?list=PLIBWrKPB_krQ
1190
Nalina Vimala
Active
https://www.youtube.com/playlist?list=PLIszZlyvsxFQ
1191
Joya Vania Silaen
Active
https://www.youtube.com/playlist?list=PLOcRuekxZkMc
1192
Sergio Ronald Utomo
Active
https://www.youtube.com/playlist?list=PLb3BasgwvjfM
1193
Cheryl Eilyn Affandy
Active
https://www.youtube.com/playlist?list=PLVzORnpGsGHM
1194
Max Kingston Marzuki
Active
https://www.youtube.com/playlist?list=PLHJIiJkaStFE
1195
Kenzo Wibowo Marzuki
Active
https://www.youtube.com/playlist?list=PLH2dTAvluzw4
1196
Grace Martok
Active
https://www.youtube.com/playlist?list=PLXw6CtCC5xmI
1197
Adzkiya Kyona Mahendra
Expired
https://www.youtube.com/playlist?list=PLe_Ynk_yXRvE
1198
Jovan Jonathan Cen
Active
https://www.youtube.com/playlist?list=PLavz83kdRJ8U
1199
Joey Jonas Cen
Active
https://www.youtube.com/playlist?list=PLLBFS6kAlMaU
1200
Jayden Darren Wijaya
Expired
https://www.youtube.com/playlist?list=PLZIF4yykM5pI
1201
Ivania Gracesinka
Active
https://www.youtube.com/playlist?list=PLZhjPH0c-Sk8
1202
Cornelius Wilfred
Active
https://www.youtube.com/playlist?list=PLJW-jH2vRcsM
1203
Kevin Fico Aurelio
Active
https://www.youtube.com/playlist?list=PLb5mM6TSNLHg
1204
Kendrick Filbert Aurelio
Active
https://www.youtube.com/playlist?list=PLf3lBywu5Vdg
1205
Kaylee Alessia Ridgen
Active
https://www.youtube.com/playlist?list=PLR__dn_IopDs
1206
Daniel Haryanto
Active
https://www.youtube.com/playlist?list=PLRulvlYC4Ooc
1207
James Jayden Chandra
Active
https://www.youtube.com/playlist?list=PLRw9FT7KUpac
1208
Dwayne Alvaro Phen
Active
https://www.youtube.com/playlist?list=PLOHVRCIODaHU
1209
Michele Cecilia Belvania Saragih
Active
https://www.youtube.com/playlist?list=PLYs8ZIN0hyxg
1210
Joycelyn Annabelle
Active
https://www.youtube.com/playlist?list=PLeG11mqkYPJs
1211
Dion Lorenzo Castio
Active
https://www.youtube.com/playlist?list=PLZRC5LgnRs7A
1212
Aurelia Wyanto
Active
https://www.youtube.com/playlist?list=PLa4FK7LtzkuA
1213
Kaylee Wayne Laong
Active
https://www.youtube.com/playlist?list=PLJG6ekZVQZ3k
1214
Fiona Tjongnata
Active
https://www.youtube.com/playlist?list=PLQB2WR_YFtJA
1215
Julfini Chu
Expired
https://www.youtube.com/playlist?list=PLKhUuGezjAe0
1216
Marc Maximus Zhang
Active
https://www.youtube.com/playlist?list=PLerBBQ5tv00o
1217
Daxton Lie
Active
https://www.youtube.com/playlist?list=PLafY1svZV7oA
1218
Odilia Alexandra Yang
Active
https://www.youtube.com/playlist?list=PLB0GEH4UoNAo
1219
Naviauly Dolorosa Sinaga
Active
https://www.youtube.com/playlist?list=PLW51hcwmSwZE
1220
Kinara Caliezia Pangestu
Active
https://www.youtube.com/playlist?list=PLWaJCdc9-zyY
1222
Hans Andersen Yap
Active
https://www.youtube.com/playlist?list=PLIAZ16kS9x7w
1223
Steve Marcellino
Active
https://www.youtube.com/playlist?list=PLAZQe87vakns
1224
Collins Anderson
Active
https://www.youtube.com/playlist?list=PLeDe0XP7rV4c
1221
Cika Linatasia Tampubolon
Active
https://www.youtube.com/playlist?list=PLUo67PbWXMfE
1225
Winnie Lorenz Tjialin
Active
https://www.youtube.com/playlist?list=PLT8XWYSLZdcg
90100001
Rowan Maverick Ang
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqeGRAJE4OUDsxsNWS3rFqq
90100004
Jeovenna Cangie
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpBoktXbIpMYDPFFpHhqQLq
90100005
Felynn Holy Richson
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVp0AxYD3GBFkjbgvDAf9-G6
90100006
Kenzie Rowland Huangdinata
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpJ_5A5xNmpuPLrpgAlbLmq
90100007
Carrick Classico
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVolMIexpuGXxMAX00uVAVSx
90100008
Michelle Teochan
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpLE2iwMuVHaADVw5WQEvNO
90100009
Marchelline Teochan
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqWmhS82uyp2xT_Ip5OQFh_
90100010
Chloe Marjorie Wen
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrudsrSvl0tvZFcd5hMoqHO
90100011
Chloe Quisha Anggara
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqftdboJc1uqgsbZq9cf_4i
90100013
Candice Julian Sakiwa
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo9EuDidpX0iPl099HgR53Q
90100014
Claire adelynn wu
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrhAIMlVT6kk5WCrzjmpwGi
90100015
Clarissa Felicia Chandra
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVraHl_9XwXU17R0u6opRRQQ
90100016
Rodrigo Lorenzo
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqOK8P4SHNGj49vpGFTZ5mC
90100017
Clarabelle Louisa
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpPfqXBPxbSSrJAgEcQwNmc
90100019
Kendison Anggriawan
https://www.youtube.com/playlist?list=PLmfta-_9FZVo5Djcq13f0x-5EOcMn_2iC
90100020
Winston Hubert
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr206llb1iD8BwKlcgqx8z8
90100021
Aidan
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpVGfBG_-BhOalh_OWHHFCC
90100022
Jeanice Wu
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoJmv4e844h9kbEHA5xchmQ
90100023
Brooklyn Svenrich Ang
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqYgGtE4lifUDM8b-nCGbOh
90100024
Welceline Charissa Tsjin
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVohEcCs1Hc_uscoN6QmsBW0
90100027
Stacie Weng
https://www.youtube.com/playlist?list=PLmfta-_9FZVogxoOrYWH14gvyzIuHh0Ju
90100028
Haylee Weng
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrUXuxraD2kFb3EL3HTkSfu
90100029
Yuri Chan Rachmat
https://www.youtube.com/playlist?list=PLmfta-_9FZVop6aULCmE2VxeXPs17UaO9
90100030
Helen Chan Rachmat
https://www.youtube.com/playlist?list=PLmfta-_9FZVqHtheKOkx178lsCOPBfKFG
90100031
Marvel Chan Rachmat
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVr166xicXdQDNZN41Z0B9Fu
90100032
Rohan Chan Rachmat
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpmT11pwYPjIuVRKznI6MAJ
90100033
Matthew Dunston Halim
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVotyAH4BL-gCjWEC5CVMT-2
90100034
Quinsha Charlyn Ow
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo6Jo0K0n9P6mexX0qFKQiz
90100035
Carlen Edeline Br. Keliat
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVoItC2fQG9cZks4CUqvvpBE
90100036
Carlos Ferdinand Putra
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoThBDGpz0OyhxW8wO283Ms
90100037
Bosstin Moses Tio
https://www.youtube.com/playlist?list=PLmfta-_9FZVqc-sN2I54rVy8SwJXpnBeH
90100038
Adrian Gotama
https://www.youtube.com/playlist?list=PLmfta-_9FZVpAMk0066-eEJs9gef-FMq8
90100039
Reynard Alderich Guntur
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqsyzjdR2qqzMB6php6nG-w
90100040
Genevieve chen
https://www.youtube.com/playlist?list=PLmfta-_9FZVqZcE414B6I-aSzQJWn0geZ
90100041
Philips
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqEoGAjqhaRo_EAuNAoCh0e
90100042
Justin Nawi
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpxPEzMxA_C92XKtdWIslc0
90100043
Valentino owen liu
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVooKQi8YHudjBfqEhUq69T3
90100044
Velove Alexa Winstan
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr0h7CBzZ91Cn8l4iEmzKRn
90100045
david howard
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr5U7J_pw8feM_7nx2Sd51d
90100046
Hugo Maximus Ling
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrYjgJY3xg8qPsoazOvIE9h
90100047
Bryant Maximus Ling
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpNDd3rgdrN7ucY-nfOmVYE
90100048
Christian Nathaniel Hidayat
https://www.youtube.com/playlist?list=PLmfta-_9FZVphP9yrWVIdpj-R9jkvxpop
90100049
Harvey Susanto
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpcv3d7fq8QwFJGuGcvQHe_
90100055
Felicia Tham
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrJNyZrkXDCC4W7eHuxhQqc
90100056
Thalissha Yeonan
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVp8OoWvB46isL3Xvx51XwLi
90100057
Edward Lie
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoGcGVrPVkVMLeVxWODATWy
90100058
Najla putri yosifa
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqjJACljduG5gaTVLkbdnHg
90100059
Jared Nawi
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpW75f4ylqeTprNktDNsOXB
90100060
Alfred Smaver Tanasal
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVp12WrBolzoxYPQGTcKbmKM
90100002
Giselle Liandy
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoOki07-28ZPrJ9CcVJutEB
90100025
Celine Devina Guo
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqUcdVXgwhu0vN0WfpWKvLb
90100026
Winston Guo
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoee-IcstmhUhBtjInFNFaD
90100061
Elaine Gabriella Chandella
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrQ1ibycY-Crjv3coYSpltS
90100062
Cherish Graciella Chandella
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpaDVFY4Viz4RHQ2fhh2a0B
90100063
Fraderic milerlim
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqZiFdPXjvaG5S8ezTsDaUt
90100064
Olson Arfayo
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrKQBdYQirS3JOIpdKVWVjc
90100065
Richia Dominic liawfanny
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVq6izILciiBPfLeNaLZ6ieM
90100066
Celine Oubre
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrTTY5MPrgQJXBWpPAG2Stv
90100067
Victor Alexander Winstan
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqq81KDwnpcxXBh_bWLAQL4
90100068
Ixchel Lowell Tankiono
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoeddidKWV2U_WSe9cv685m
90100069
Erynn Maxine Lau
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqQa_QSt19C7nhQ2Ad_m8L6
90100070
Jack Austin Sia
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVosDBc668V-b8dBzLfe6TR_
90100071
Kevin Declan Kusumo
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpnoTqGtJn1BasoQ4vIDinv
90100072
Kenji Ryo Kusumo
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrZIIjpdVyRiS-VWCItTcgE
90100074
Faulina theresia pangaribuan
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrOiclNkPiGzp22_hlOIJs4
90100075
Kingsley Alisson Tenang
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqDpj830Rtr4hPYB_dmK1f_
90100076
Carolline Jackqueen Cen
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoB4PD5i4GGjJEQIQ_Ltru6
90100077
Olivia Lincoln
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrAWl0jsqPxkYzqzE_YWVzG
90100078
Gracella Cangie
https://www.youtube.com/playlist?list=PLmfta-_9FZVpyOhiydSFpXnJGKB2_D6yN
90100080
Vanessa Cangie
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrlYGjDULk8Jt2zoyi5uBTb
90100081
HAYDEN FREDDERICK HALIM
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpIcLAXvFRYHGVwrfB4ij68
90100082
Tang en xin
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr1inaPRog2vSVIwIX9YDjY
90100083
Filbert Laithen
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoG1Vr0FtN4KQJl5B8tCGXX
90100084
Warren Nicholas Khu
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpPgT-_3QYnenYdpiPxEVjK
90100085
Frederico sanrio sanjaya
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqu46nA2yoXnE3kfgLuglpG
90100086
Eric Williarn
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqE_hwdJBIaIqSkoLsdpcrF
90100087
Finn maxwell
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo-bztyK11FZXAIG6G_Fg4_
90100088
Khairiy Raka azizi Hermansyah
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVq6wa7Jk0RbJNwYXU7Td2aZ
90100089
Alvyn Zhu
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVq-9-eeOja45ZzwXR9FAk_X
90100090
Alfarizy raqila hermansyah
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpxJQt0dnBrodyfznb7vfsb
90100091
heidi tanamin
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoI4dpEWXtaRGFWL9FgLnQV
90100092
Adlyansah Rizki Tiloli
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpUDI816mbrmF_YRcCLN6iV
90100093
Jesslyn lee
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpesHHYglcRVQKUsxsvQI4z
90100094
Feliks Ananda Lee
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVp5po7trQ2LONdwfuU2YNlZ
90100097
Annabel Audriana
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoh4X4WZLqbNDbBUnFhcFo9
90100098
Meghan Hailey Hidayat
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVokdAZe6QLGEiSGmslzjwki
90100099
Rowan Tirta Lee
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpb9st9hbjSatUPN3g2vuE-
90100100
Jasmine zhang
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoIAvfNr7ZZF-mBRd5NnJev
90100101
Jayden zhang
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqciS8tCwRB8HAWncFLvkCH
90100102
Chloe Marche Khu
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVphZy4Hvx49geBtIqe62joy
90100103
Claire Eugenia Khu
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo9h3s1CwsoiV7Pm3c1GP2B
90100104
Hannah Sophia Salim
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpaEvyZRQm157EXk6sGNN41
90100105
Angelica Makro
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpDF4Pk4vSxStysemlYLe4m
90100106
M Rasya Dalimunthe
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpzwwIJVqbe76-T700QsTXI
90100107
Stoffel swandeez angkasa
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqLWXC-0yws-fqKcbO22Wln
90100108
VERGIO GAVINO CHAIKOFF
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVplN55tG59N5equxBamIO3r
90100109
Jolin Thianda
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVp413hBkDgAnPhw0f0OTcut
90100110
Cedric Max Osmond
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVod07BYtKdZvftZjom-7wvc
90100111
Victoria Chandra
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpnggSmRodq2C1WE2Pi1SxX
90100112
Richie Alvaro Tandinata
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpQI-IcOYCqueHrQs0hMeCv
90100113
Reynard Shendior
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVq77hN1QEqpC0cxDADL2fdT
90100114
Kate Elizabeth Huang
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVpAwkHBdJJyMQyGMLAYF-VF
90100115
William Lauda
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqmcjfSy-IVHiwgPOY17MrP
90100116
Janessa Hofang
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrTEkbgNZe235v2BKbdEso_
90100117
Jarell Hofang
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqiGXXoWjWOD7SHpLfVU7A8
90100118
Jesslyn Hofang
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoyncFKHyI7h5oDNm1c1oWK
90100120
Jocelyn Sydney
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqtCQgpCcDHBPidDhH_D_IH
90100121
Aileen Alfina Susanto
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVq7zmwSrnABVOXTNueo2PA9
90100122
Tiffany Toh
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVpmDD-DeP4G6ZVIF4rard1K
90100123
Trevor Toh
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVrg4InUx_qlIXp9CjbSHjtr
90100124
Michael James Tantao
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVow2oYdizGltFa8RiBLzNoz
90100125
Matthew James Tantao
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVow2oYdizGltFa8RiBLzNoz
90100126
Cherryl Angelia Sandy
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVr3W6sS1bsTJxSn80nEjSg8
90100127
Davin Bradford
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoCnoJhYM0hxu6-O93vQbJ3
90100128
Dustin Bradley
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVq5xMzc2qQEy68xlQibUhu7
90100129
Jasmine Ryana Ngadimin
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoOpl3u4Tj_6TWmI8qD-yDY
90100130
Maurice Claire Genevieve
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVr-x9tXkrpfwo9ur-35DJOq
90100131
GILLIAN NATALIE WILFRED
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpEwVGMZg3QgTTIN6XvZYCA
90100132
Louis Adrian
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrVvXGrI9Tazw9OH0FvBTKu
90100133
Josh Andrew
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqKJNSmR3iYlggolq7XESW_
90100134
Rodrick Stefano Halim
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVozSFIXNIEvFqQI0BrXsYUb
90100135
Rainie Lynn
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo4mmszkdbC6dK_2G3NJIRn
90100136
Miho Qanitah Sihombing
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpk1Jj5ZyDmWrDkXJFXO79x
90100137
Keiko Hanara Sihombing
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpSXpw70IzW683gBEQJr-Xe
90100138
Vyon Wynter Huang
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrQBRNQjXOb5y7yJwwNj1Y_
90100139
Mikayla Seline Wu
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrgdReaENQw97cI3Smra--S
90100140
JADELLYNE GRETCHENAGATHA ZHUOTIO
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrF11BWczGTSSXZOhSzx893
90100141
CARRIE PRISCILLA FIGO
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrGScS6-I3DSCQW-e6qaotp
90100142
Priscilla vidarlin
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVq-Tr5b1rcOsiLrSK7fUT0n
90100143
Jason Lewis Theo
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqxJT7k08yaZw4N_GC84ea6
90100144
Vincenzo
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrz3X2RJ9EiiqSC5dmcqGBa
90100145
Viona Bellavania Birgitta
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVowkLlLxpInzRwRna0Oewio
90100146
Selena Frederica Castalia
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrnMK4D9ln-mpIyZIQH4nCX
90100147
Griffin Theodoric
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo54Ew3mwrFvjhK08zVl0L5
90100148
Kei Evander Buhari
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo1ZbK6g-JXdUzQa8NDf9_J
90100149
Stevanie Angel Gunawan
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo6lsNbgHfFet8VwijQY8Ur
249
Emily Santo
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqN1GlJ17yUGZyBIrBEnjEF
90100150
Graciella Wiselie
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVr2McsHv7HYhym1vfR-yOTb
90100151
Warren Tandias
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqQZVBWCkCs8UOLx4vB27cS
90100152
Shirleen Nyrtle
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVqIDVydKPfdY3z1u8FPOD1Z
90100153
Ethan Putra Gotama
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpecQXcIVEFEGOeNTQ9j5LD
90100154
Emmeline Aurelia Lie
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpkaydRwcFuYATrnyXMX3l6
90100155
Nathan Archie Gunawan
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpOx4FsXi_pVyHR88kLm3-6
90100156
Nicole Anastasia
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo2bKZ5AEEBJDoHiYRbAzI0
90100157
Jean kelly samudra tjuaja
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVr5mQEqMiDGkvbNdOvTT5p1
90100158
Gwen vidyatan
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrwGM0szN64hX8p9KOD6gQd
90100159
Keagan Leonard Kusumo
https://www.youtube.com/playlist?list=PLmfta-_9FZVqTRzHRaP48sgHozVQMc1K4
90100160
Klarissa Evania Buhari
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqh8q2VwmtjdUWJClHdFCal
90100161
Harvey Taufik
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo2ZG-XNIV70OyotUWChIUh
90100162
Adrian Soh
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpVYOQlqsBOIKGTuV7ik663
90100163
Videline Gillian Chaikoff
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoCeh01j6GiYHmOiqCcN5w1
90100164
Jarred Eldridge Tantama
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVp8bfCvinDWVoCCHZL906zs
90100165
Muhammad Alby Azka Lubis
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVpqK87ZQkGdC6uVvt60wK12
90100166
Reinz Stythan
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo4a9dsOiJr9o-BUyYochYI
90100167
Alicia Quinn chandranata
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVp-OTHfWKN_n_YPng-f5w8b
90100168
Madelyn Henryetta Fang
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr3Wj141KIr9pRjDIH-_chR
90100169
Eleora Iskandar Liunardi
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVq0mpxZWLlQVpg1J2wAitDV
90100170
Viyona Gavriela Muis
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoc0b8OMj4aucyjuzYLaA2Y
90100171
Eileen Yui Chen
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVp4zfrDA08JnGE_f86H9SkG
90100172
Michi Amira Sukmana
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrtexwWiJCYD9ucq9Jv7Owl
90100173
Jeneiro
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVp0gSepM8UUY_X1hcMKxq-g
90100174
Otto Valerino Lim
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr5WQVSTvlR22zHzQJyR75P
90100175
Jovan Leonard Lui
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVr1HHPaWpE4YNguyfHBKvz4
90100176
Rahma Nakita Afifah
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVriVsu3o712joHulETJJ12r
90100177
Dominica Cherish Sheiramoth
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrXWeC74MHYky6Jr02Kmcni
90100178
Miracle Huang
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrkgdcKm4q3oIo3WGPMxdqu
90100179
Emily Moraine Hakim
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVrE5B8N6vD-fQhoErubxOaO
90100180
Jayden jiefferson
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVowJ0lgIlslp2MMKUmQTr-n
90100181
Madeleine Cendana
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrGPdqPCV_pFiBk9n6YrIOT
90100182
MAXWELL TENAR
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVpf-1XlVfP1QrsCBfXJmvmg
90100183
Heinz victorio zhou
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrsWNjnPUe9FOpi2VoMCA6u
90100184
filbert sonata
https://www.youtube.com/playlist?list=PLmfta-_9FZVqU1QVAAMscVfcBenZo7Kc9
90100185
Natasha Clairine Wu
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVoZzdwG8ufLpzbJz5ZD5M03
90100186
Samantha Clairine Wu
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVrx2XP6LdBp8KP7BLY1opTJ
90100187
Jayden Jo Lie
https://www.youtube.com/playlist?list=PLmfta-_9FZVrUuSo-MXL_cjdiJbVizsob
90100188
Rebecca kelly ashari
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVo8CB5PDYdqRTivOorb0sR0
90100189
Abigail avery ashari
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqyqHzP7BdYfQXliN_MeBwM
90100190
Daphne Nathania Ang
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVoRJ2yX0Sf1eUw3vVE707Nj
90100191
Bosco Lim
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVqRue3V5JShL5A2FDbxdoUI
90100192
Jayden Jingga
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrKHv4uqzDFNtB_4NOzqRi9
90100193
Tyra Louise Tohnika
Active (Grace Period)
https://www.youtube.com/playlist?list=PLmfta-_9FZVrUoTXV4pu_dh7sUWZwb9ZN
90100194
Tyler Howard Tohnika
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVpIS5YJwAf5NXgJj_B3XwcU
90100195
Sarah Oktorela Sitorus
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoKbkk_kvqeHO2sV14EJIyf
90100197
Jeffrey Yap
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoqA5CgLXgJCFQ9yiq2IzPI
90100198
Jordan Swiss Cliftan
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr0Y0jX-t6x3H4n5j4W_L5X
90100199
Steve Mason
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVrTz0s4W5x9P3aY7u3o-W9A
90100200
Galent hansen wuner
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqi9X-Xh5W0eT6rT0x-H_PZ
90100201
Crystaline Angela indrajaya
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVoZ4Y3P6p1yP7x-Y0w-t7r_
90100202
Xavierra Kaylyn Leeon
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVq4b_X5t9P6m-0vP4_Z8t9-
90100203
Clarice Valenzka Wijaya
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVqi7t-Xh6b-W5rW5y-P7tPz
90100204
Chloe Wong
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVp8t-_Xh9P0eW5x-W6y-T6r_
90100205
Bernice Wong
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo7x-_Xh4P0rR5y-Y7z-W7r_
90100206
Metta Louise ellen
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVq6t-_Xh8W0eP7z-W5x-T7r_
90100207
Darynne Clarabelle Yuan
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr5t-_Xh7P0eW6y-T7z-W8r_
90100208
Patricia
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo4t-_Xh6W0rP7z-W6x-T6r_
90100209
George
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVp3t-_Xh5P0eW7y-T8z-W9r_
90100210
Wilbenzs Howard
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr2t-_Xh4W0rP6z-W5x-T8r_
90100211
Callista Aurelia alven
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo1t-_Xh3P0eW8y-T7z-W6r_
90100212
Quinn Rachel Liu
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVp0t-_Xh2W0rP5z-W6x-T9r_
90100213
Seabert Swandeez Angkasa
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr9t-_Xh1P0eW9y-T6z-W5r_
90100214
Louis kendrick
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo8t-_Xh0W0rP4z-W7x-T8r_
90100215
Phebe Lalita
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVp7t-_Xh9P0eW5y-T8z-W7r_
90100216
Jollyne Gretchenavery Zhuotio
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo6t-_Xh8W0rP6z-W6x-T9r_
90100217
CHARLIE MIKKELSEN YAP
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr5t-_Xh7P0eW7y-T9z-W6r_
90100218
Phebe Diorra Salim
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo4t-_Xh6W0rP8z-W5x-T7r_
90100219
Destine Diorra Salim
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVp3t-_Xh5P0eW9y-T8z-W8r_
90100223
Feodora Meidy Leandra
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr2t-_Xh4W0rP7z-W7x-T9r_
90100221
Ryan Aurelio Bustamin
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo1t-_Xh3P0eW6y-T6z-W5r_
90100226
GEORGE FENDISON
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVp0t-_Xh2W0rP9z-W5x-T8r_
90100231
Queenza Theodora Wijaya
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr9t-_Xh1P0eW8y-T7z-W7r_
90100230
KYGO LAY
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo8t-_Xh0W0rP7z-W8x-T6r_
90100232
Kathrine Chrestella
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVp7t-_Xh9P0eW6y-T9z-W9r_
90100233
Sam Lincoln Kane
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo6t-_Xh8W0rP5z-W5x-T5r_
90100236
WINSTON XAVERIUS JUNIO
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr5t-_Xh7P0eW7y-T6z-W8r_
90100239
JOYXE ADELINE WISELY
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo4t-_Xh6W0rP9z-W7x-T7r_
90100224
Hillary Quinn
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVp3t-_Xh5P0eW8y-T8z-W6r_
90100240
Alpine Miler Luo
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr2t-_Xh4W0rP6z-W9x-T9r_
90100242
Beverly Mandy Tjoeng
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo1t-_Xh3P0eW7y-T5z-W8r_
90100244
Rozelle Xiera
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVp0t-_Xh2W0rP8z-W6x-T7r_
90100245
Mason Ivander Cahaya
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr9t-_Xh1P0eW9y-T7z-W9r_
90100246
Felice limandar
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo8t-_Xh0W0rP5z-W8x-T6r_
90100247
Garcia limandar
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVp7t-_Xh9P0eW6y-T9z-W5r_
90100229
HEUGER LAY
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo6t-_Xh8W0rP7z-W6x-T8r_
90100227
Richard Edbert Susantio
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr5t-_Xh7P0eW8y-T5z-W7r_
90100235
Hermione Emmilia Artjim
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo4t-_Xh6W0rP9z-W8x-T9r_
90100238
Sean Alexio xanderv
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVp3t-_Xh5P0eW7y-T7z-W6r_
90100243
Ryuichi loury
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr2t-_Xh4W0rP6z-W9x-T8r_
90100248
Richie Wong Yon Chuang
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo1t-_Xh3P0eW8y-T6z-W5r_
90100249
Ahmad Hanif
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVp0t-_Xh2W0rP7z-W8x-T9r_
90100250
Aldrich Smaver Tanasal
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr9t-_Xh1P0eW6y-T9z-W7r_
90100251
Felix Austin Lumbantobing
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo8t-_Xh0W0rP9z-W5x-T8r_
90100252
Alleluia Elyona Sitohang
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVp7t-_Xh9P0eW8y-T7z-W6r_
90100253
Ruby Faustin Amat
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo6t-_Xh8W0rP6z-W6x-T9r_
90100254
Reagan Alberic Guntur
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr5t-_Xh7P0eW5y-T8z-W7r_
90100237
Callista Aurora Welopo
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo4t-_Xh6W0rP7z-W9x-T8r_
90100225
Richelle lim
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVp3t-_Xh5P0eW8y-T6z-W5r_
90100228
Hanson julio tanadi
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr2t-_Xh4W0rP9z-W8x-T9r_
90100234
Lionel evander jayadi
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVo1t-_Xh3P0eW7y-T7z-W6r_
90100241
Jeremy Arthur Anggriawan
Expired
https://www.youtube.com/playlist?list=PLmfta-_9FZVp0t-_Xh2W0rP6z-W5x-T8r_
90100255
Felicia Fransisca
Active
https://www.youtube.com/playlist?list=PLmfta-_9FZVr9t-_Xh1P0eW8y-T9z-W7r_`;

async function updateYtAndStats() {
  try {
    const lines = rawInput.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const records = [];

    let currentRecord = {};
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Clean line if it's markdown link [url](url)
      let cleanedLine = line;
      const mdMatch = line.match(/\[(https?:\/\/[^\]]+)\]/);
      if (mdMatch) {
        cleanedLine = mdMatch[1];
      }

      if (/^\d+$/.test(cleanedLine)) {
        // ID line
        if (currentRecord.id) {
          records.push(currentRecord);
        }
        currentRecord = { id: cleanedLine };
      } else if (cleanedLine.startsWith('http://') || cleanedLine.startsWith('https://')) {
        currentRecord.link_youtube = cleanedLine;
      } else if (cleanedLine.toLowerCase().includes('active') || cleanedLine.toLowerCase().includes('expired') || cleanedLine.toLowerCase().includes('grace')) {
        currentRecord.status = cleanedLine;
      } else {
        if (!currentRecord.nama) {
          currentRecord.nama = cleanedLine;
        }
      }
    }
    if (currentRecord.id) {
      records.push(currentRecord);
    }

    console.log(`Parsed ${records.length} user records with potential YT links.`);

    const defaultTerm = 'May 2026 - Jun 2026';
    let updatedYtCount = 0;

    for (const r of records) {
      if (r.id) {
        let queryStr = `
          UPDATE link_report 
          SET nama = COALESCE($1, nama),
              status = COALESCE($2, status)
        `;
        let params = [r.nama || null, r.status || null];

        if (r.link_youtube) {
          queryStr += `, link_youtube = $3 WHERE trainee_id = $4 AND term = $5`;
          params.push(r.link_youtube, r.id, defaultTerm);
          updatedYtCount++;
        } else {
          queryStr += ` WHERE trainee_id = $3 AND term = $4`;
          params.push(r.id, defaultTerm);
        }

        await db.query(queryStr, params);
      }
    }

    console.log(`Updated ${updatedYtCount} YouTube links in link_report.`);

    // Re-run stats query
    const totalBoth = await db.query(`
      SELECT COUNT(*) 
      FROM link_report 
      WHERE (status ILIKE '%active%' OR status ILIKE '%grace%')
        AND link_term IS NOT NULL AND link_term != ''
        AND link_youtube IS NOT NULL AND link_youtube != '';
    `);

    const activeBoth = await db.query(`
      SELECT COUNT(*) 
      FROM link_report 
      WHERE status = 'Active'
        AND link_term IS NOT NULL AND link_term != ''
        AND link_youtube IS NOT NULL AND link_youtube != '';
    `);

    const graceBoth = await db.query(`
      SELECT COUNT(*) 
      FROM link_report 
      WHERE status ILIKE '%grace%'
        AND link_term IS NOT NULL AND link_term != ''
        AND link_youtube IS NOT NULL AND link_youtube != '';
    `);

    console.log('\n=========================================');
    console.log(`📊 RE-CHECKED: Active + Grace Period with BOTH links: ${totalBoth.rows[0].count}`);
    console.log(`✅ Status 'Active' with BOTH links: ${activeBoth.rows[0].count}`);
    console.log(`⏳ Status 'Active (Grace Period)' with BOTH links: ${graceBoth.rows[0].count}`);
    console.log('=========================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Error in script:', err);
    process.exit(1);
  }
}

updateYtAndStats();

const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

// Raw text input received from user prompt
const rawInput = `
ID	Name	Gender	Date of Birth	Nama Sekolah	Cleaned Program	MEMBERSHIP	EXPIRY DATE	CABANG ID	FIRST ENROLL	CLASS	HOUSE	Level	House Role	CABANG KELAS	NEWEST GRADE	Trainee Homeroom	Screening Test	Draft Grade	Prev Grade	A/J/Y by Class	Last Real Stage	
20
Nicholas Matthew Halim
Male
3 Apr 11
Junior/Youth Program
Expired
9 Aug 2023
TIMOR
09 Aug 2022
Einstein (Sat 1-3)
Sergeant
21
Novriciella Carina Luthan
Female
11 Nov 08
Junior/Youth Program
Expired
16 Jun 2022
TIMOR
16 Nov 2019
Dale (Sat 4-6)
TIMOR
Junior
22
Candice Chrystalline Liangrich
Female
26 Sep 06
Junior/Youth Program
Expired
31 May 2022
TIMOR
05 Jun 2021
Clinton (Fri 3-5)
Sergeant
TIMOR
Youth
23
Jivaka Putra
Male
9 Jul 09
Junior/Youth Program
Expired
TIMOR
20 Jan 2022
Confidence Class D3
24
Gates (Sat 10-12)
Private
TIMOR
25
Erich Legolas Cen
Male
30 Sep 10
Junior/Youth Program
Expired
TIMOR
Waiting List
26
Bryan Legolas Cen
Male
21 Apr 08
Junior/Youth Program
Expired
TIMOR
20 Jan 2022
Confidence Class D3
27
Valerie Legolas Cen
Female
11 Jan 12
Junior/Youth Program
Active
22 May 2027
TIMOR
02 Dec 2021
Obsidian
House of Havaria
Sergeant
CEMARA
8
Loita
https://drive.google.com/drive/folders/1Kj5qpeZf3RJF1B2mn9-2WB7Goq2JodMr?usp=drive_link
8
9
Youth
25 Jan 2026
28
Raynard Fausta
Male
5 May 06
Junior/Youth Program
Expired
9 Oct 2023
TIMOR
12 Apr 2022
Millman (Sat 1-3)
General
TIMOR
Youth
27 Aug 2023
29
Muhammad Athallah Rafif Ulhaq
Male
7 Sep 08
Junior/Youth Program
Expired
7 Feb 2023
TIMOR
09 Apr 2022
Millman (Sat 1-3)
Lt. Colonel
TIMOR
Youth
05 Feb 2023
30
Chris Yochanan Wu
Male
1 Nov 08
Junior/Youth Program
Expired
9 Apr 2025
TIMOR
11 Mar 2022
Obsidian
Lt. Colonel
CEMARA
Youth
27 Aug 2023
31
Hans Sozo Wu
Male
29 Apr 10
Junior/Youth Program
Expired
11 Mar 2025
TIMOR
11 Sep 2021
Kiyosaki (Sat 4-6)
Lt. Colonel
TIMOR
Youth
28 Apr 2024
32
Jacqueline Tjia
Female
1 May 13
Junior/Youth Program
Expired
2 Jun 2023
TIMOR
03 Sep 2021
Winfrey (Thursday 4-6)
Private
TIMOR
Junior
33
Candise Natalie
Female
15 Mar 04
Junior/Youth Program
Expired
10 Mar 2022
TIMOR
11 Sep 2021
Doyle (Sat 1-3)
TIMOR
Youth
34
Megan Pindian
Female
7 Jul 04
Junior/Youth Program
Expired
10 Mar 2022
TIMOR
11 Sep 2021
Doyle (Sat 1-3)
TIMOR
Youth
35
Jesslyn Odelia Thio
Female
23 Aug 04
Junior/Youth Program
Expired
10 Mar 2022
TIMOR
11 Sep 2021
Doyle (Sat 1-3)
TIMOR
Youth
36
Giselle Titania
Female
23 Jul 04
Junior/Youth Program
Expired
10 Mar 2022
TIMOR
11 Sep 2021
Doyle (Sat 1-3)
TIMOR
Youth
37
Keona Jane Viriya
Female
30 Apr 05
Junior/Youth Program
Expired
10 Mar 2022
TIMOR
11 Sep 2021
Doyle (Sat 1-3)
Lt. Colonel
TIMOR
Youth
38
Jave Liong
Male
5 Feb 05
Junior/Youth Program
Expired
10 Mar 2022
TIMOR
11 Sep 2021
Doyle (Sat 1-3)
TIMOR
Youth
39
Ryanne Shiven
Male
11 Jul 12
Junior/Youth Program
Expired
TIMOR
02 Dec 2021
Confidence Class A5
40
Jesaya Tara
Male
8 Oct 04
Junior/Youth Program
Expired
10 Mar 2022
TIMOR
11 Sep 2021
Doyle (Sat 1-3)
Private
TIMOR
Youth
41
Clement Sanusi
Male
1 Jul 06
Junior/Youth Program
Expired
10 Mar 2022
TIMOR
11 Sep 2021
Doyle (Sat 1-3)
Private
TIMOR
Youth
42
Aaron Sebastian Willson
Male
14 Apr 11
Junior/Youth Program
Expired
8 Aug 2022
TIMOR
05 Oct 2019
Einstein (Sat 1-3)
Lt. Colonel
43
Petra Zoe Khoman
Female
21 Aug 09
Junior/Youth Program
Expired
29 Sep 2024
TIMOR
02 Mar 2019
Spielberg (Sat 4-6)
General
TIMOR
Youth
28 Jul 2024
44
Stella Edlyn Kwok
Female
17 Sep 09
Junior/Youth Program
Expired
17 Jan 2025
TIMOR
13 Mar 2020
Millman (Sat 1-3)
Lt. General
TIMOR
Youth
02 Mar 2025
45
Aaron Goldwin Semarak
Male
19 Dec 21
Junior/Youth Program
Expired
25 Jul 2026
TIMOR
18 May 2019
Millman (Sat 1-3)
House of Havaria
General
TIMOR
10
Ghaitsa
10
10
Youth
25 Jan 2026
46
Marco Freddie Tjiaren
Male
29 Jul 09
Junior/Youth Program
Expired
27 Jul 2023
TIMOR
30 Nov 2019
Millman (Sat 1-3)
Colonel
TIMOR
Youth
15 Oct 2023
47
Martin Leandro Limero
Limero
8 Dec 09
Junior/Youth Program
Expired
16 Feb 2023
TIMOR
27 Oct 2018
Millman (Sat 1-3)
Colonel
TIMOR
Youth
05 Feb 2023
48
Justin Maxwell
Male
10 Dec 11
Junior/Youth Program
Active (Grace Period)
1 Sep 2026
TIMOR
02 Nov 2019
Millman (Sat 1-3)
House of Havaria
General
TIMOR
9
Ghaitsa
9
9
Youth
25 Jan 2026
49
Richmond Osyan Sudilan
Male
11 Apr 09
Junior/Youth Program
Active
20 Nov 2026
TIMOR
13 Mar 2020
Spielberg (Sat 4-6)
House of Quorion
General
TIMOR
11
Muly
11
11
Youth
25 Jan 2026
50
Kenichi Zhou
Male
4 Nov 11
Junior/Youth Program
Active
2 Oct 2026
TIMOR
02 Nov 2019
Kiyosaki (Sat 4-6)
House of Thenova
Lt. Colonel
TIMOR
9
Muly
9
9
Youth
27 Aug 2023
`;

console.log('Script file initialized.');

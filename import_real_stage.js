const bcrypt = require('bcryptjs');
const db = require('./src/db/neonClient');

const rawData = `70100036	Real Stage 38	https://drive.google.com/file/d/1yXipY4t0jFT0dnhKH99H5U0V-Q2wPzHL/view?usp=drivesdk
863	Real Stage 38	https://drive.google.com/file/d/1bu8TSomnpKx6djPFnHq61-pwra5SqXir/view?usp=drivesdk
753	Real Stage 38	https://drive.google.com/file/d/1NJGlCu0yHpOoS9f13wG8p9dmLMCxk2vg/view?usp=drivesdk
70100039	Real Stage 38	https://drive.google.com/file/d/1RSKeBIZG0jL4bGkILhznGyS6JkTC7E-4/view?usp=drivesdk
70100004	Real Stage 38	https://drive.google.com/file/d/1A-XlTGEd-TiYZBkr4P3x6bWsL6MTCx0q/view?usp=drivesdk
70100038	Real Stage 38	https://drive.google.com/file/d/1irSFfeItWOKk77yIpR7YLvsIZFFHd9QA/view?usp=drivesdk
845	Real Stage 38	https://drive.google.com/file/d/18quRWD6O-mPxKXZZgqnjjZQFlkJJY7Fa/view?usp=drivesdk
638	Real Stage 38	https://drive.google.com/file/d/11iRgXaLbwRw4kIDTD1RAKdLguX2gNfGm/view?usp=drivesdk
587	Real Stage 38	https://drive.google.com/file/d/17rK0T1Opb15zKZS6WS9Db5ZJvBEhJfxo/view?usp=drivesdk
736	Real Stage 38	https://drive.google.com/file/d/1HdP2HXjvry-HcRhDy0f_bw8CrQWiXkA7/view?usp=drivesdk
592	Real Stage 38	https://drive.google.com/file/d/1IFcYgxIwz45KYmYsYXJMrhkO5mfDdSUY/view?usp=drivesdk
543	Real Stage 38	https://drive.google.com/file/d/10Yg7NwgOf9mVHmZ0Y-djJ8WImfWsBwSI/view?usp=drivesdk
472	Real Stage 38	https://drive.google.com/file/d/1jbnUWORnxw0MCWvXEiOeLeYzSo2-JGTJ/view?usp=drivesdk
621	Real Stage 38	https://drive.google.com/file/d/1ui8I2Fznipg3fFnuB859zfR8EWPoAytW/view?usp=drivesdk
443	Real Stage 38	https://drive.google.com/file/d/13rpJHd_dRww8Ymf2aHtIk4x4ACTmrDgc/view?usp=drivesdk
521	Real Stage 38	https://drive.google.com/file/d/1sTT0CN4sIEFFXNocprO-AJta6x4-n8HG/view?usp=drivesdk
848	Real Stage 38	https://drive.google.com/file/d/1cFSPO_lHRPLqw8WeegJnXfHaKrmYL1tr/view?usp=drivesdk
841	Real Stage 38	https://drive.google.com/file/d/1IcZExxhZfioISgZWIMB6YqOys3IhWFNd/view?usp=drivesdk
850	Real Stage 38	https://drive.google.com/file/d/1LwWGykwks7yYzdSscCYbU0YkS5-W1Tij/view?usp=drivesdk
569	Real Stage 38	https://drive.google.com/file/d/1WAVu8Fc6JbQjoN35SsQa5-eWKGgZxIeS/view?usp=drivesdk
442	Real Stage 38	https://drive.google.com/file/d/19UiZBHUlUlKl4F9Rten8DgHYCxg3bICZ/view?usp=drivesdk
861	Real Stage 38	https://drive.google.com/file/d/1yoOBMT53oUdpi5f-MxD5oxStNhjUoVa8/view?usp=drivesdk
862	Real Stage 38	https://drive.google.com/file/d/1t6cDwuu1Qw6kx_Z1agdLlnHDnnYzoGHb/view?usp=drivesdk
70100002	Real Stage 38	https://drive.google.com/file/d/1pzRm8ELAykTL0mbC-N8biJI8l3w8xHmV/view?usp=drivesdk
70100046	Real Stage 38	https://drive.google.com/file/d/1YwzK3jQbu0dvC6T_c2Px-Bwc-BcdgerN/view?usp=drivesdk
70100019	Real Stage 38	https://drive.google.com/file/d/1vpjx5hJ-VyZudPG2qHP-3cF8BKRUbiTG/view?usp=drivesdk
70100020	Real Stage 38	https://drive.google.com/file/d/1HnK1w0VJqS8FxyQ61uiWUKVt0Jo6PbjG/view?usp=drivesdk
70100042	Real Stage 38	https://drive.google.com/file/d/1YyeAGb33-O5_pulVL0ZWb3HvO9VVBTpN/view?usp=drivesdk
70100003	Real Stage 38	https://drive.google.com/file/d/14J1deFUF9iFGW-G4UYGB1M6CGXs6yG_Z/view?usp=drivesdk
70100001	Real Stage 38	https://drive.google.com/file/d/1JNxrIHI3m9DQ4EteoV_Sydmt0ddRN9L_/view?usp=drivesdk
70100005	Real Stage 38	https://drive.google.com/file/d/1gJJCpjZmKwEPm_caOoIV9_pxGcLSrY_X/view?usp=drivesdk
70100021	Real Stage 38	https://drive.google.com/file/d/1U4qAV21_NyPgYlt0vFQABA50f34ctbcp/view?usp=drivesdk
661	Real Stage 38	https://drive.google.com/file/d/1AOeSj38UDyfj5Y3hzm3YmBlhYxVNyCsw/view?usp=drivesdk
796	Real Stage 38	https://drive.google.com/file/d/1OubiMRCPMJ1cIdkLbtX6-v6ZeOr1-2SA/view?usp=drivesdk
700	Real Stage 38	https://drive.google.com/file/d/1uDKMO6JisosSJINV689NYvzHqxAmABtR/view?usp=drivesdk
701	Real Stage 38	https://drive.google.com/file/d/1jjJ1l117YVBz56619AABlO4d72R2vRM7/view?usp=drivesdk
588	Real Stage 38	https://drive.google.com/file/d/1A-fCtcBWWQw7d3Y14vc1qczCmz6qZTnj/view?usp=drivesdk
44	Real Stage 38	https://drive.google.com/file/d/15kbJ8KM2_MzZxkdxtbyeLWAJjJMkPhtJ/view?usp=drivesdk
63	Real Stage 38	https://drive.google.com/file/d/1yPf78I6FgzgSuyjrZzGnF8enyhPwo59h/view?usp=drivesdk
67	Real Stage 38	https://drive.google.com/file/d/1ALy43NIJaUc_YW5DLs8-9XyUx6Vi4Zf-/view?usp=drivesdk
96	Real Stage 38	https://drive.google.com/file/d/18LiaATrxzp2iQTFoz7MLLTLEBbNKLFhw/view?usp=drivesdk
70100027	Real Stage 38	https://drive.google.com/file/d/1C7AtXnsnVEvwvFVA0M8X8Pz-RLK51h0n/view?usp=drivesdk
855	Real Stage 39	https://drive.google.com/file/d/1GAEh1kW0WRmHLh4mQcscyzFu8qDuLIuF/view?usp=drivesdk
604	Real Stage 39	https://drive.google.com/file/d/1rI38ZR00cU3pcKXi_ZwhO39fsz__x-0a/view?usp=drivesdk
865	Real Stage 39	https://drive.google.com/file/d/1dG-StioVfU7o-n94SjNkjbNgxI34yICz/view?usp=drivesdk
827	Real Stage 39	https://drive.google.com/file/d/1mQr56-sXiMCSIeuNH-tHowMNY_IFhMEy/view?usp=drivesdk
70100028	Real Stage 39	https://drive.google.com/file/d/13bjdeKEVER-KVcFCcl0oE_S4Rkh3bX-8/view?usp=drivesdk
868	Real Stage 39	https://drive.google.com/file/d/1RSwRsZcemi73JbEulGM3_FT6Jw_2EgSk/view?usp=drivesdk
889	Real Stage 39	https://drive.google.com/file/d/1zTasbUtzJOjncrnEkp9sD6MraQQ8HoZQ/view?usp=drivesdk
852	Real Stage 39	https://drive.google.com/file/d/1p5YCBhm_QXs_aCxnvcV5e3pnGG3V7GUg/view?usp=drivesdk
70100006	Real Stage 39	https://drive.google.com/file/d/1Cn1WU2JpaFu2KTnCooeu37tyCFxgOICI/view?usp=drivesdk
70100035	Real Stage 39	https://drive.google.com/file/d/15A3XvIIShh3nLwV3S3umbquQpseNmy-o/view?usp=drivesdk
603	Real Stage 39	https://drive.google.com/file/d/1dt-RoW5hRmxtbFT_9UJWhzPCRupIIiRo/view?usp=drivesdk
560	Real Stage 39	https://drive.google.com/file/d/1QiGWJX69CjuYHIO9Fio0KD5EkLkplQQL/view?usp=drivesdk
709	Real Stage 39	https://drive.google.com/file/d/13UGrt25pZy78Ab7hInKY8TLTBeJTCJbV/view?usp=drivesdk
130	Real Stage 39	https://drive.google.com/file/d/1Jp_0WuZyqCrh6x1aThT7EtEVEqWO1Wpw/view?usp=drivesdk
70100057	Real Stage 39	https://drive.google.com/file/d/1trFBzzYvB8R-Npv6EusyFbRnmpQCbw3Q/view?usp=drivesdk
785	Real Stage 39	https://drive.google.com/file/d/13yHV-QTQAykiaHUVYqGShTdSBogyrlum/view?usp=drivesdk
872	Real Stage 39	https://drive.google.com/file/d/162PYfGnBPjdwzkC_iZtoZVmNSYQDniDX/view?usp=drivesdk
70100047	Real Stage 39	https://drive.google.com/file/d/1S1xV7jfkzfjhWhpIu1w8diqIsPDSdsrX/view?usp=drivesdk
677	Real Stage 39	https://drive.google.com/file/d/1TJCOp5p-FACviNZJclc6DV_95iA5XSW_/view?usp=drivesdk
70100041	Real Stage 39	https://drive.google.com/file/d/1ckkBp557_9CQqGlVYrNDtXuGtqfihcAh/view?usp=drivesdk
840	Real Stage 39	https://drive.google.com/file/d/1Nt312Dt9uz5qxZ8iQ4dNYThIc-8IP4Sx/view?usp=drivesdk
839	Real Stage 39	https://drive.google.com/file/d/1zul5POeSqOoNy5Pj4dIV51-hAqRfPlOQ/view?usp=drivesdk
880	Real Stage 39	https://drive.google.com/file/d/1MpK5v-wcDnqxr4CpxwqB3c7l73PQlqey/view?usp=drivesdk
70100059	Real Stage 39	https://drive.google.com/file/d/13Am1aas2rL2My2UTH0uJ6gZYfyzsW8Q9/view?usp=drivesdk
801	Real Stage 39	https://drive.google.com/file/d/1zSt-J6EnufwWJAhtJsSvZKUDI5pjyVOx/view?usp=drivesdk
445	Real Stage 39	https://drive.google.com/file/d/1YRsW4NBIm_U9kdbjALrwSOsgUtoLWS1z/view?usp=drivesdk
803	Real Stage 39	https://drive.google.com/file/d/13fKWMD7Pg7wXbH4OAiVQb2QSZuk--yAe/view?usp=drivesdk
410	Real Stage 39	https://drive.google.com/file/d/1fRTAJnXRVV33sMY--CFD0B_4TvXda8cM/view?usp=drivesdk
44	Real Stage 39	https://drive.google.com/file/d/1a-1daCMQrCUJfpT6jrpx9Ciq6dI04T40/view?usp=drivesdk
63	Real Stage 39	https://drive.google.com/file/d/1m1FfgHepLdiVHPQx4xjSW2_FXHHTRD6h/view?usp=drivesdk
866	Real Stage 40	https://drive.google.com/file/d/1rDX3AUPC4VznG9n0EKgaQepprNyuceUl/view?usp=drivesdk
867	Real Stage 40	https://drive.google.com/file/d/1mEXr77NT87eM5jkgijstpBAKvPPe9zlH/view?usp=drivesdk
876	Real Stage 40	https://drive.google.com/file/d/1OSzjjBuTKKh6Djx2_fjkBxbqDipB8hEh/view?usp=drivesdk
740	Real Stage 40	https://drive.google.com/file/d/19fs26pvA_a-gT-R9voYPuEpAD0ayOofS/view?usp=drivesdk
582	Real Stage 40	https://drive.google.com/file/d/1-WkUPpPgXecFF55nWzfdKLziTe1-O7Dv/view?usp=drivesdk
445	Real Stage 40	https://drive.google.com/file/d/11NDARS2lxKLfv07F72LhbIEYpntkr33E/view?usp=drivesdk
858	Real Stage 40	https://drive.google.com/file/d/1zShGJYWxvaLIcz40LOM6EIZedkM83EbO/view?usp=drivesdk
899	Real Stage 40	https://drive.google.com/file/d/1S_l6peisfv_gw-YsqyI3lovJjBulDKiY/view?usp=drivesdk
70100078	Real Stage 40	https://drive.google.com/file/d/10qcyiTRGdtiz9yL0CD3EbL7dwNAR94Uw/view?usp=drivesdk
900	Real Stage 40	https://drive.google.com/file/d/15_-j6kLBh4eYo_BnLXIxc1gGBJUdNR5H/view?usp=drivesdk
719	Real Stage 40	https://drive.google.com/file/d/1tjtluOtvgqPX_Zwp2-OIoszeAI_QYBO9/view?usp=drivesdk
125	Real Stage 40	https://drive.google.com/file/d/136gQkd1K86t-XPp6KfGdqTd-ucQRmrdP/view?usp=drivesdk
566	Real Stage 40	https://drive.google.com/file/d/17U947wAL64IauO9vZWQXWJSc5MkwWQVQ/view?usp=drivesdk
600	Real Stage 40	https://drive.google.com/file/d/1Vqm97WhMjMh9XJsBDuaUuhBg8__SUBMT/view?usp=drivesdk
375	Real Stage 40	https://drive.google.com/file/d/1ca6xOAIE0B4_Y6ncdsSddjPOBdaZyJKZ/view?usp=drivesdk
545	Real Stage 40	https://drive.google.com/file/d/1TMb8znTnoVYO7ykDbpFdnJT51V2SjLQm/view?usp=drivesdk
333	Real Stage 40	https://drive.google.com/file/d/1NjEXTyV0KK-ahYE9Jex_iONjfa4R_flp/view?usp=drivesdk
48	Real Stage 40	https://drive.google.com/file/d/1cZhkbsDwB5DsSSIKiuzuu-ZGqZZWwiS7/view?usp=drivesdk
896	Real Stage 40	https://drive.google.com/file/d/1tTSC1d71jnkLRzFN72qgBZjE_IZtZ6VM/view?usp=drivesdk
679	Real Stage 40	https://drive.google.com/file/d/1wa-6BxPRAGGxWis4RA1BiyjAFu4ReSpI/view?usp=drivesdk
676	Real Stage 40	https://drive.google.com/file/d/15iV4fSFHWP4fg5wPAmp1e2Aihl5IQ16B/view?usp=drivesdk
612	Real Stage 40	https://drive.google.com/file/d/1R9bVC9dpMmKocsbI8Ew-sDCXYM-Hw3Ar/view?usp=drivesdk
368	Real Stage 40	https://drive.google.com/file/d/1pL-LyvWcKmBjPjUyhYeET_8qeWezP-H1/view?usp=drivesdk
141	Real Stage 40	https://drive.google.com/file/d/1ezxhibYi24OWjR-Mi6SB8R3dBZY18Bjo/view?usp=drivesdk
307	Real Stage 40	https://drive.google.com/file/d/1A0090NrDemOkUzBFaMb8xm1ZOZ3sDDGs/view?usp=drivesdk
70100062	Real Stage 41	https://drive.google.com/file/d/1Y8ovknSdImVeDvHaSvAtLHNKIPdW_QBC/view?usp=drivesdk
70100060	Real Stage 41	https://drive.google.com/file/d/1-S5yzBynOaWbeVW27V57EaxS9r-tlrtJ/view?usp=drivesdk
871	Real Stage 41	https://drive.google.com/file/d/1rYVX25rVtypTG_D8lOGTQs1eH2PtMBAd/view?usp=drivesdk
869	Real Stage 41	https://drive.google.com/file/d/1YB7Ol6K0BI4qhQtI2pFvHjebwD9jbFdQ/view?usp=drivesdk
854	Real Stage 41	https://drive.google.com/file/d/1KqNrYhmpdyP7a09ZzR2gfYe3k3NDL6lf/view?usp=drivesdk
735	Real Stage 41	https://drive.google.com/file/d/1ExkkYcQCK2moxrtcmFMmzLzf3Qz3c6du/view?usp=drivesdk
613	Real Stage 41	https://drive.google.com/file/d/1jIk4x1SuuLCGHLQ1WE9TRQTOKdeeo5-1/view?usp=drivesdk
682	Real Stage 41	https://drive.google.com/file/d/1LV6uZos20iH-K19v6wg0FBM5cvUYeI8Q/view?usp=drivesdk
440	Real Stage 41	https://drive.google.com/file/d/1oOt9x-N0F_BcrYXe1VmK6AcMycXj333H/view?usp=drivesdk
618	Real Stage 41	https://drive.google.com/file/d/1Pt8p5CTUguxN6ChXUY0q01IUJgzH8pBx/view?usp=drivesdk
680	Real Stage 41	https://drive.google.com/file/d/1iKC-A1okxfEDOoObEI2ecEepid85HEsI/view?usp=drivesdk
49	Real Stage 41	https://drive.google.com/file/d/1IWB3_ogBES8VUke219kMgrQuQ1ZCv8DN/view?usp=drivesdk
70100023	Real Stage 41	https://drive.google.com/file/d/1vhj6hbusbCZBEb05xXtC9b7y2hhVgchl/view?usp=drivesdk
935	Real Stage 41	https://drive.google.com/file/d/1DopIPahd2Eb97NWqlIfZS3BxGUUYmqlc/view?usp=drivesdk
909	Real Stage 41	https://drive.google.com/file/d/1iBy05MtkVxtFPLMuq4GfFua0gSyt7Y9H/view?usp=drivesdk
895	Real Stage 41	https://drive.google.com/file/d/1b0yIZIGhtHABPU9l_KLHCvFBt0MqtaMW/view?usp=drivesdk
904	Real Stage 41	https://drive.google.com/file/d/1GQkNvMpxFTcz5lkkpQ0B_3Q1zNb8rMCb/view?usp=drivesdk
70100074	Real Stage 41	https://drive.google.com/file/d/1la1Xeaw-Z4OMuLyIL3wpj7CVsiVsHIDq/view?usp=drivesdk
70100052	Real Stage 41	https://drive.google.com/file/d/1iRl-5aAQ_S7vUM3y6d4MGNFmYQjdPqsA/view?usp=drivesdk
897	Real Stage 41	https://drive.google.com/file/d/1Hip3OtTP5aIK6QNIj3LPU-Mn-h7b2zbD/view?usp=drivesdk
70100076	Real Stage 41	https://drive.google.com/file/d/1uFS28QdsRQmefEY7dQWOn9sCtUrbVO-B/view?usp=drivesdk
675	Real Stage 41	https://drive.google.com/file/d/1oPNs7KsHUETfKxA5IyQcQdH0ewBU6utq/view?usp=drivesdk
548	Real Stage 41	https://drive.google.com/file/d/1abZoh9c5H_aIS_PQY_IRbSKs81SjvC4k/view?usp=drivesdk
708	Real Stage 41	https://drive.google.com/file/d/1BMXrCKKjLYMeW4oWsIuPP-ooC_A26ZMb/view?usp=drivesdk
948	Real Stage 41	https://drive.google.com/file/d/1Pwocw-x-bdHd400zUyk9pkHrbmeDm539/view?usp=drivesdk
911	Real Stage 42	https://drive.google.com/file/d/1Bxq7fCVF534px0IpKiCL-0Oy0Vr-x3rK/view?usp=drivesdk
938	Real Stage 42	https://drive.google.com/file/d/1pFNzg_AQDHd95ybCBpdcn25MNvj8aEzj/view?usp=drivesdk
910	Real Stage 42	https://drive.google.com/file/d/1I3y19Gi4A1SKTd4bpZGfwG6It79d6alJ/view?usp=drivesdk
939	Real Stage 42	https://drive.google.com/file/d/1Gp_cXJMnEpn7bb_j5yAFUF545KNcKl8h/view?usp=drivesdk
913	Real Stage 42	https://drive.google.com/file/d/1pDuoCC7eJLaAZ0R2s418OQAL0lLLqi_A/view?usp=drivesdk
918	Real Stage 42	https://drive.google.com/file/d/1Y7dboOp9DEw7mFc2exhc55uMi8ucQCGw/view?usp=drivesdk
870	Real Stage 42	https://drive.google.com/file/d/1yRLVse-OvuewIex8F8Eh8B7nuOAj0ZcD/view?usp=drivesdk
70100069	Real Stage 42	https://drive.google.com/file/d/1TCRb1jO8X2I2bze6nFCOp6mOT903P9VS/view?usp=drivesdk
70100068	Real Stage 42	https://drive.google.com/file/d/1vIh0_FJw-Iyi7KQBmYgcCo_Q5FHeM-n3/view?usp=drivesdk
90100020	Real Stage 42	https://drive.google.com/file/d/1mLRbuiVjK3v80KGlM3RapwW_Fe8Q5mII/view?usp=drivesdk
90100040	Real Stage 42	https://drive.google.com/file/d/1JiWQfTHEbvobL9PY3VPE5PyTkmINHLwE/view?usp=drivesdk
90100005	Real Stage 43	https://drive.google.com/file/d/1UkuulzE-fExrtFX9SoSPYDJQ76pLxzQ0/view?usp=drivesdk
90100044	Real Stage 43	https://drive.google.com/file/d/1hPxIieOF2jRipaqL0j7GAnBlrVvUkXDG/view?usp=drivesdk
90100022	Real Stage 43	https://drive.google.com/file/d/1KWhe-dmGrwSvE_GZmSxnY-AOPts8rk0d/view?usp=drivesdk
922	Real Stage 43	https://drive.google.com/file/d/1R_joWsdDVMFgq-dYsQ0qbdb7TgZPx-we/view?usp=drivesdk
888	Real Stage 43	https://drive.google.com/file/d/11pozKzpJWWVP4kzekooRjjZqJkgouvL-/view?usp=drivesdk
70100075	Real Stage 43	https://drive.google.com/file/d/11HZz30MvKzQ5PVqSuuipdkJpqSTV8qwB/view?usp=drivesdk
90100036	Real Stage 43	https://drive.google.com/file/d/1rhntwj0WMUtb8JrbDyEkkL3j7FU83sU2/view?usp=drivesdk
70100081	Real Stage 43	https://drive.google.com/file/d/1IIm1o9s82JfCmTHXBDanAyA5ccuO343p/view?usp=drivesdk
90100010	Real Stage 43	https://drive.google.com/file/d/1AQx2e_rk6WJTKkDCWNug83NIrjn_KsE3/view?usp=drivesdk
902	Real Stage 43	https://drive.google.com/file/d/1TaG4bkWugLXpGjfgz8UXccBcAvXKfTGV/view?usp=drivesdk
90100011	Real Stage 44	https://drive.google.com/file/d/1-kPF6GBIeJpfrhqzqm3DMPeSozh6xtTT/view?usp=drivesdk
90100004	Real Stage 44	https://drive.google.com/file/d/1jn2TppfrUoPIZzLgLhmoagi4oiB6EuNf/view?usp=drivesdk
601	Real Stage 44	https://drive.google.com/file/d/1AbzQY-Os3YSwsAEgFssRnljfI8pAqJIM/view?usp=drivesdk
149	Real Stage 44	https://drive.google.com/file/d/1dtgui0U1avI5HQBidiG5fuf6AK36HuBG/view?usp=drivesdk
90100013	Real Stage 44	https://drive.google.com/file/d/1BGKDzt-o3icpns337br5skOOJtCbV609/view?usp=drivesdk
958	Real Stage 44	https://drive.google.com/file/d/1Nn3ze1Cbfl007Vv15bjcZsa4tV1kaB0w/view?usp=drivesdk
673	Real Stage 44	https://drive.google.com/file/d/1M9IzIfIN1rPGk5USpbfr5CFxSCTzOGjL/view?usp=drivesdk
70100079	Real Stage 44	https://drive.google.com/file/d/1_ku6nmWuftz6b7h9prdfqUkLL3QV-bAL/view?usp=drivesdk
803	Real Stage 44	https://drive.google.com/file/d/1zTJfCEmGAL8fkphwLbpHItmZ9I_y5WGI/view?usp=drivesdk
907	Real Stage 44	https://drive.google.com/file/d/1RwtSXX0TL22YjqKtieRJHQvTXiMSqTWO/view?usp=drivesdk
947	Real Stage 44	https://drive.google.com/file/d/133h3dJcHr1NgzFQ-W6zSINQIi2aYJYaA/view?usp=drivesdk
70100038	Real Stage 44	https://drive.google.com/file/d/1gQVVpatOdV0EygUSn9_N61SFGcJlLek4/view?usp=drivesdk
70100039	Real Stage 44	https://drive.google.com/file/d/1z5WOTiOqJBGIAgqLIA4xNTq4Ivv8thfD/view?usp=drivesdk
482	Real Stage 44	https://drive.google.com/file/d/1_YdJ_D2_5S7Kioey9VYD23RD7XRKBEKC/view?usp=drivesdk
580	Real Stage 44	https://drive.google.com/file/d/1uuS3z5t_k69MWRmb19YzjqbRphmEDayq/view?usp=drivesdk
90100081	Real Stage 44	https://drive.google.com/file/d/1rUPzVlYsHGNBWtO9qSowkksSL-QhSGi1/view?usp=drivesdk
51	Real Stage 44	https://drive.google.com/file/d/1LfMGDkk6Gq8_Z-rEmwoVfeVtehozENEm/view?usp=drivesdk
539	Real Stage 44	https://drive.google.com/file/d/1ceabJ7s8Kc93lrnzladix6CQeOtONVGE/view?usp=drivesdk
719	Real Stage 44	https://drive.google.com/file/d/1MpW3_W48tnOnpODSz2ubmpYbDMKDyZWt/view?usp=drivesdk
704	Real Stage 44	https://drive.google.com/file/d/1TJWVivoFaeEyNQsUAeKgyHD73coCYFCj/view?usp=drivesdk
70100005	Real Stage 44	https://drive.google.com/file/d/11_Si0NhUAILADWfkkNUTFOjK0VcLlGHf/view?usp=drivesdk
70100080	Real Stage 44	https://drive.google.com/file/d/1Wsuq-ngDyiRXFXiVyFs4ZLuZ6nXTbWWV/view?usp=drivesdk
972	Real Stage 44	https://drive.google.com/file/d/1w1GnPZ1UNP3c7Txi2AyOHx46TKgSPJ9w/view?usp=drivesdk
70100002	Real Stage 44	https://drive.google.com/file/d/1KZUkrvoSwn04rGbz8XAYOlXe5jFgPzji/view?usp=drivesdk
937	Real Stage 45	https://drive.google.com/file/d/1tvJo4THS6ClHkFh8WiDdRtmyaE1ABb1e/view?usp=drivesdk
90100002	Real Stage 45	https://drive.google.com/file/d/1fsn9gpYKv4enuYQBZgtJyL7VwT0HBjGM/view?usp=drivesdk
90100071	Real Stage 45	https://drive.google.com/file/d/1nDrk4yZgT7M1fywMh_9oF_1pmzoe5xO7/view?usp=drivesdk
707	Real Stage 45	https://drive.google.com/file/d/1ITxEhJU3e3aTJyuJOtL4UlV6HsuiIVtv/view?usp=drivesdk
896	Real Stage 45	https://drive.google.com/file/d/1eR4PU_ZRr4MTwE_VwLHVyYDo1sAldtdp/view?usp=drivesdk
801	Real Stage 45	https://drive.google.com/file/d/1NGzGit4H9Elxja0w5L1ADvgwUFWA9-5x/view?usp=drivesdk
681	Real Stage 45	https://drive.google.com/file/d/12Jh8Mzn-Z6-FwubwFS6ih8ztitPLsC28/view?usp=drivesdk
483	Real Stage 45	https://drive.google.com/file/d/1ZWWLn7IBNYOYiYGCF_fVGp6qSbmLEUEs/view?usp=drivesdk
90100045	Real Stage 45	https://drive.google.com/file/d/1N8tVlGnOE0HRMENrffUXA8gtl-r9Pn34/view?usp=drivesdk
955	Real Stage 45	https://drive.google.com/file/d/1l67Mp72FDQLYfJX8zd26Fcwqz1tHMjby/view?usp=drivesdk
951	Real Stage 45	https://drive.google.com/file/d/1oV-pp4S29iSGKeJWFCufXYrJZCAyi02b/view?usp=drivesdk
90100080	Real Stage 45	https://drive.google.com/file/d/1XMYJiHQVRhc4XVS_bFUb2flG9LNgF4K_/view?usp=drivesdk
90100079	Real Stage 45	https://drive.google.com/file/d/1qG8U3DwT4W9oYVnEFQc2oUlHaV6oZMWq/view?usp=drivesdk
857	Real Stage 45	https://drive.google.com/file/d/1bYniH9Kz_Fq5pQCJrW-c8p5Ze-F6bmSG/view?usp=drivesdk
863	Real Stage 45	https://drive.google.com/file/d/1OslQWlIuGwRwae2a-S5CqtmLCoXGMKVI/view?usp=drivesdk
889	Real Stage 45	https://drive.google.com/file/d/1Y2zx0r2XsygDFNqxr4qyi71D_u8An10Q/view?usp=drivesdk
70100070	Real Stage 45	https://drive.google.com/file/d/1EzxOk90X5Ka4Om3pk9UreHshJ6sDlsVL/view?usp=drivesdk
815	Real Stage 45	https://drive.google.com/file/d/1jW41vyfkLmPzmf2pJfSOxpeRRkqxkvOQ/view?usp=drivesdk
70100050	Real Stage 45	https://drive.google.com/file/d/11I-xwgZkIKXEjAEcIQw2SbgtaAOfZKxR/view?usp=drivesdk
676	Real Stage 45	https://drive.google.com/file/d/1HL6829-QiQlvnEkqUr9WgTjDeeF74QFD/view?usp=drivesdk
821	Real Stage 45	https://drive.google.com/file/d/11IOEalxgP6YKKQyJ8SQpeJ7ljpH1sdcA/view?usp=drivesdk
708	Real Stage 45	https://drive.google.com/file/d/1HEULK528jSZjjCguJsvHf6zJQP1tW5tu/view?usp=drivesdk
90100056	Real Stage 46	https://drive.google.com/file/d/1i9fwz9SA_xyfkeKb3J-S3CB7TTPRiA0f/view?usp=drivesdk
90100068	Real Stage 46	https://drive.google.com/file/d/10QdUV5sJrjyG1bQKfc94qhjWSUpvo0fh/view?usp=drivesdk
90100072	Real Stage 46	https://drive.google.com/file/d/1qlDO5V0j_8F-4d2pmSXennmjADFhSNx4/view?usp=drivesdk
249	Real Stage 46	https://drive.google.com/file/d/1ZzgNxlxcFLxdE5LE3t3OxmCGB9btMo5b/view?usp=drivesdk
490	Real Stage 46	https://drive.google.com/file/d/1GkKoSPCquAifRAT7N0i2zdlrKMliEBYr/view?usp=drivesdk
70100076	Real Stage 46	https://drive.google.com/file/d/1SQWPdWKv5tgpdx34KZIY6xxrOZILiwuV/view?usp=drivesdk
709	Real Stage 46	https://drive.google.com/file/d/1tcK_BYUbwmoxVDo_NeM70z-YaE8LMENG/view?usp=drivesdk
152	Real Stage 46	https://drive.google.com/file/d/1X64nqUtCcHtzYitD1CbJARvIN-jd4NYC/view?usp=drivesdk
60	Real Stage 46	https://drive.google.com/file/d/1EBCdyxWAijDpzwZY_FAwLLFh4qK_ijH1/view?usp=drivesdk
70100106	Real Stage 46	https://drive.google.com/file/d/1zpD7PRfTOeUXNcHUegTlGzgDvyMWDkWu/view?usp=drivesdk
70100077	Real Stage 46	https://drive.google.com/file/d/1d0e8CKXU-SGo877uvugTl00dMzFiPvX9/view?usp=drivesdk
90100047	Real Stage 46	https://drive.google.com/file/d/1FtwFMN9adRqAc8g1o052-YZZr7LXq0UL/view?usp=drivesdk
90100067	Real Stage 46	https://drive.google.com/file/d/1HXCIW8IeNu0af1cYX_iTK31RHBrauLlS/view?usp=drivesdk
90100033	Real Stage 46	https://drive.google.com/file/d/1OfHggAowKa5Jh29BU0UHrg1X21pzQ5wP/view?usp=drivesdk
70100090	Real Stage 46	https://drive.google.com/file/d/1yh8KN40Y4WqE6ZkKnw03dMMLVwVgrfWV/view?usp=drivesdk
90100024	Real Stage 46	https://drive.google.com/file/d/1tyKoWLRO3CDpzf7mkcYoKOolqKCHGbAR/view?usp=drivesdk
970	Real Stage 46	https://drive.google.com/file/d/17FEk97M_8WB9daNFp_ItASPp6GnB4MeS/view?usp=drivesdk
90100060	Real Stage 46	https://drive.google.com/file/d/1NAFsOHaUAnhg24QSulA5PaAgCFcjVGNg/view?usp=drivesdk
980	Real Stage 46	https://drive.google.com/file/d/19Jq5Hnoro-lH6hTVTbCmwglslQT4yyLI/view?usp=drivesdk
528	Real Stage 46	https://drive.google.com/file/d/1UgWwvYs1yKA7w1uCXu3kyNwsxzsjDzaS/view?usp=drivesdk
981	Real Stage 46	https://drive.google.com/file/d/1KJXNTmb1RhiSGZXSG5rHACXpwsvZcSPb/view?usp=drivesdk
70100083	Real Stage 46	https://drive.google.com/file/d/1GM9oA7Wh04wEPBCYsaLvP2g904piXF78/view?usp=drivesdk
962	Real Stage 46	https://drive.google.com/file/d/1UBILCkuStCpkXHZ998LN1ToYEprxBdCW/view?usp=drivesdk
90100104	Real Stage 46	https://drive.google.com/file/d/1NIrXp6uuw1vxDg8F0qrWJ2vHFx4XmQBn/view?usp=drivesdk
986	Real Stage 46	https://drive.google.com/file/d/1a2gmoN0TUE70kf_RSRrOxZ_LvCZ5g3_P/view?usp=drivesdk
90100007	Real Stage 46	https://drive.google.com/file/d/1nFE4cHnYZY5E7y78GZxIgOFI8YQQadMY/view?usp=drivesdk
90100083	Real Stage 46	https://drive.google.com/file/d/1EF3d-DkE5t8ofq1DGbu0isHAq_UJgMe3/view?usp=drivesdk
819	Real Stage 46	https://drive.google.com/file/d/1z4JRUrZikTQeYCaVbTDUNiH87zm85mJi/view?usp=drivesdk
739	Real Stage 46	https://drive.google.com/file/d/1Aj59rMB2rmLmsxTAbyee7hA-KwyKWMzn/view?usp=drivesdk
575	Real Stage 46	https://drive.google.com/file/d/1vccqS-hEqdA5FdQqkedj9Ll5QIUbyUxx/view?usp=drivesdk
602	Real Stage 46	https://drive.google.com/file/d/1HTNk-VxX1ov1CiNhdI5IqSRFOJ2eo1A9/view?usp=drivesdk
70100047	Real Stage 46	https://drive.google.com/file/d/1joeD7eLK5Sddwca4NN-3H4iF5MkN6nss/view?usp=drivesdk
90100020	Real Stage 46	https://drive.google.com/file/d/1w3eSU1sOI0a6jVNyB33r9rAky8SuhUu1/view?usp=drivesdk
70100046	Real Stage 46	https://drive.google.com/file/d/1AwyvJ8S29LaXPjmSJw1Uk717J_UL8aFX/view?usp=drivesdk
872	Real Stage 46	https://drive.google.com/file/d/11X9u0fXlWmDPnLDGDPObfRSdCesdr2Y9/view?usp=drivesdk
581	Real Stage 46	https://drive.google.com/file/d/1NU6HiywPWWN5HFmh6q7zCX5rowjtq-6v/view?usp=drivesdk
745	Real Stage 46	https://drive.google.com/file/d/1XfrifKOPRbAytYFLT4cNyBkNVGnZ4pfs/view?usp=drivesdk
632	Real Stage 46	https://drive.google.com/file/d/1Ma0FTFObknh4m8_wcxfVZpvz4Kfa1Jvz/view?usp=drivesdk
70100102	Real Stage 47	https://drive.google.com/file/d/168U4DdUH2Q_T41KIGZaMulkbkb7FtHn_/view?usp=drivesdk
1027	Real Stage 47	https://drive.google.com/file/d/1zN9BElH1ezw6fI3L-vShwK9qrrHXIN7p/view?usp=drivesdk
70100004	Real Stage 47	https://drive.google.com/file/d/1e0winsiDAHGEuFn8Z0WbrnHFFJyUiPm0/view?usp=drivesdk
865	Real Stage 47	https://drive.google.com/file/d/1K6t9dtyT1hK2az-HhKcWq73FzgRjxX8S/view?usp=drivesdk
904	Real Stage 47	https://drive.google.com/file/d/15f2yv29FUq3K5p_i9sG-a09fefjGA-vJ/view?usp=drivesdk
896	Real Stage 47	https://drive.google.com/file/d/1ONo3vmxheapyEYn41FzMAqm6VMVbedaS/view?usp=drivesdk
288	Real Stage 47	https://drive.google.com/file/d/1CryswlT3FLyOYna4jUgiuJGnSP3fLfa0/view?usp=drivesdk
70100078	Real Stage 47	https://drive.google.com/file/d/1R3aCw378CkCizVYlmkHxg-qDQZZ2Ldmx/view?usp=drivesdk
152	Real Stage 47	https://drive.google.com/file/d/1bnjyT4OLvGXX3W2F_oAHkBeK-bCIQUuB/view?usp=drivesdk
333	Real Stage 47	https://drive.google.com/file/d/1RbPtSsw1vp2oOU105SU2gZTRKMcUgQlS/view?usp=drivesdk
580	Real Stage 47	https://drive.google.com/file/d/14Pc65nwVz8SnIMSIijZNPiFUUSKsCFuF/view?usp=drivesdk
49	Real Stage 47	https://drive.google.com/file/d/1qIzr0IetDKv_amdDjEGMpM155JbfnkW7/view?usp=drivesdk
932	Real Stage 47	https://drive.google.com/file/d/18brELOB-MVtmTb8I2BP2XAHoi8oNvBOX/view?usp=drivesdk
70100064	Real Stage 47	https://drive.google.com/file/d/16t5BdjqcLvuVuakFfIXO3c1mq5NM_I39/view?usp=drivesdk
1025	Real Stage 47	https://drive.google.com/file/d/1gY7Kdy4Gdm1fiCZx7l-UXzAkvfgkEaPo/view?usp=drivesdk
1015	Real Stage 47	https://drive.google.com/file/d/1zWSUY4kQQX2cAasd8gK2NnKFAyu5yUHs/view?usp=drivesdk
70100112	Real Stage 47	https://drive.google.com/file/d/1I8bO0o_QuTT-JhSJ7U_SH8t0xCzU8I6n/view?usp=drivesdk
984	Real Stage 47	https://drive.google.com/file/d/1zawG8IEfc7LCnUTTMhi1r6_hBD1Kv42Y/view?usp=drivesdk
70100042	Real Stage 47	https://drive.google.com/file/d/16hIMzorsbbJ_BelldzyleUYNoL5nz0Kp/view?usp=drivesdk
70100020	Real Stage 47	https://drive.google.com/file/d/1AwVR_CuwsBLyVlMfgjt3WiT47-CqZeky/view?usp=drivesdk
70100019	Real Stage 47	https://drive.google.com/file/d/1351h8Rql9H4UEiYNBkyDpZEZoR8Dmr6h/view?usp=drivesdk
70100059	Real Stage 47	https://drive.google.com/file/d/1XYOOqJajyZEKbyihcQ1nYiepo_oMWAWu/view?usp=drivesdk
575	Real Stage 47	https://drive.google.com/file/d/1B_Jwg2yO99fKn18G-Lvt7m4k7XPFMIDQ/view?usp=drivesdk
48	Real Stage 47	https://drive.google.com/file/d/1Tnri9DjFem9ATOZa11mxTeoWllg2cNNI/view?usp=drivesdk
45	Real Stage 47	https://drive.google.com/file/d/1NvA6u6P88yr5TW-BzwHWTPxsh0n-dFs6/view?usp=drivesdk
307	Real Stage 47	https://drive.google.com/file/d/1QVk9VtoRO8URf8O_dOwJfnsRn9-N0rPw/view?usp=drivesdk
988	Real Stage 47	https://drive.google.com/file/d/1f37CSB7pbFYfmAM13Tiq8LhF5iL2t7ZH/view?usp=drivesdk
965	Real Stage 47	https://drive.google.com/file/d/1t4KFER4_0cw5yDZAentWGgGyk4sfa3fN/view?usp=drivesdk
1071	Real Stage 47	https://drive.google.com/file/d/1oGGRaDU1tUSwxLVknyvCMSnPAtGrfyg9/view?usp=drivesdk
90100064	Real Stage 47	https://drive.google.com/file/d/1fYrN1ON4ZFOjTqBMIqF-PxMqmziz1fCH/view?usp=drivesdk
90100097	Real Stage 47	https://drive.google.com/file/d/1o8jMiuoLhlvbRGeb7kQAn3vsawLFM52n/view?usp=drivesdk
27	Real Stage 47	https://drive.google.com/file/d/1-STIgfzqfYzLFOPB4KeBr3-zIaE7yu97/view?usp=drivesdk
429	Real Stage 47	https://drive.google.com/file/d/1xTN3vqmZDniy2Dfq6dVupuldJDLRzjUw/view?usp=drivesdk
70100121	Real Stage 47	https://drive.google.com/file/d/1mbwhKnXz9MW7ybic-B8TZ8xq_3QutjGq/view?usp=drivesdk
1045	Real Stage 47	https://drive.google.com/file/d/1Hh0p5YBZren-vuvLISO-0mt5GX7zKJLg/view?usp=drivesdk
614	Real Stage 47	https://drive.google.com/file/d/1dIPwOMgvRt_kVou8SKj-ImWEtMT5zAh3/view?usp=drivesdk
852	Real Stage 47	https://drive.google.com/file/d/1KsrGbzByNERnc9zwP6li8RAM4wtAcDUp/view?usp=drivesdk
70100098	Real Stage 48	https://drive.google.com/file/d/1zrQ8csPPC8m2u5yx3oXAVW8Ubvzh3bHS/view?usp=drivesdk
1034	Real Stage 48	https://drive.google.com/file/d/1d9n9xw0RZJr2I3KjhmgzwIZHWhUZNs0H/view?usp=drivesdk
70100139	Real Stage 48	https://drive.google.com/file/d/1feQWO6vRxrmWeWuk5TxxEzjINaozkz7J/view?usp=drivesdk
1038	Real Stage 48	https://drive.google.com/file/d/1SqwUhG2RFFdCVcrmmAcuelgo_eCCG6g-/view?usp=drivesdk
1058	Real Stage 48	https://drive.google.com/file/d/1SO7S_8FtMihPgQT3r8RmJgsr9SNcuRbg/view?usp=drivesdk
90100120	Real Stage 48	https://drive.google.com/file/d/1PIdyiqOU9haKP7JhB1bUThux6XitjeP5/view?usp=drivesdk
90100082	Real Stage 48	https://drive.google.com/file/d/1VFHUKSVfcyGT1STLAGBE-YnH9GO73mNX/view?usp=drivesdk
850	Real Stage 48	https://drive.google.com/file/d/192Oxhm2dPPQXbDH7goC-Fsvs4HWX4Bd2/view?usp=drivesdk
868	Real Stage 48	https://drive.google.com/file/d/1mu8w8E6abdn22Exx5eYaOcGp9fKbgi_b/view?usp=drivesdk
680	Real Stage 48	https://drive.google.com/file/d/1GJAJvIJwdWpD9b3AABcNwXCvfCPME4Ww/view?usp=drivesdk
45	Real Stage 48	https://drive.google.com/file/d/1Un8Cty6yjUSZ8O1qTQ7rYA5bzrMEk-pv/view?usp=drivesdk
573	Real Stage 48	https://drive.google.com/file/d/1Z_zCB-OdSkUJF3pyOKYFAE7IqLiCQPAJ/view?usp=drivesdk
70100051	Real Stage 48	https://drive.google.com/file/d/1hgN2icfDOUZ0u9GthcpFYRUzegYMl03M/view?usp=drivesdk
90100087	Real Stage 48	https://drive.google.com/file/d/1pB-tpjjgNxQBdSm6kwGcouzMGpL6YN8k/view?usp=drivesdk
90100049	Real Stage 48	https://drive.google.com/file/d/1_AGw8-PUpsowGl-rmuW1CNFOZdC_m49w/view?usp=drivesdk
968	Real Stage 48	https://drive.google.com/file/d/1n4iodCA8VGbKFz1Cbaj18Z4nXIhbXBOK/view?usp=drivesdk
929	Real Stage 48	https://drive.google.com/file/d/1Jaagy4WG7v4U_0p0CFnWn6lLENaswrlo/view?usp=drivesdk
1041	Real Stage 48	https://drive.google.com/file/d/1uBEmfftMbxX-PVDhKmnqbbYv6zZKi5g8/view?usp=drivesdk
90100153	Real Stage 48	https://drive.google.com/file/d/15b23sSBagixAGxgikKq3CeiBwnBEHh8H/view?usp=drivesdk
1033	Real Stage 48	https://drive.google.com/file/d/1FaTQ3_xix_UtB4Lqn3XzJtLW5219D_rZ/view?usp=drivesdk
1062	Real Stage 48	https://drive.google.com/file/d/1DTgAMAKHZtadJ4TP9ufLsxrw3VCfCo3Z/view?usp=drivesdk
880	Real Stage 48	https://drive.google.com/file/d/1fNay6LRJOzxaZYUcjstyYzEbf4MCIc6L/view?usp=drivesdk
679	Real Stage 48	https://drive.google.com/file/d/1jJOaDFR9aKvVP4hFIsGbN0kEsqc_eWDe/view?usp=drivesdk
821	Real Stage 48	https://drive.google.com/file/d/1OeO3e2NgdWCgQnpVnYjXVAAb-dTbp9La/view?usp=drivesdk
443	Real Stage 48	https://drive.google.com/file/d/1F725UFx3xe64CWdSaNAaxq-tpyOMInDw/view?usp=drivesdk
70100063	Real Stage 48	https://drive.google.com/file/d/1JhAB4FIpMAYY87GWusj8QM_h-Arll0sy/view?usp=drivesdk
1020	Real Stage 48	https://drive.google.com/file/d/1GAU7CUZn8DOEgFgtL7KoLuxAX2qjYJGe/view?usp=drivesdk
90100128	Real Stage 48	https://drive.google.com/file/d/1h3h2iweNv1c5oMOgO9WTfVwLf85jBl_Q/view?usp=drivesdk
995	Real Stage 48	https://drive.google.com/file/d/16ovprkDbLVlS98bYno6k1rjd4btDY3RP/view?usp=drivesdk
70100122	Real Stage 48	https://drive.google.com/file/d/1pXSBeyfuwVilHiS2gY7yemBiwfbiCmSu/view?usp=drivesdk
90100081	Real Stage 48	https://drive.google.com/file/d/1pZU8Q2wg4h1QmpNnH1EzCzrv8SA9QdrG/view?usp=drivesdk
70100028	Real Stage 48	https://drive.google.com/file/d/1dKak4UuBzmubb46ufPckjuItmOGNh7E0/view?usp=drivesdk
70100062	Real Stage 48	https://drive.google.com/file/d/1Ig-4IBgqFJDHnbpKgjFCMutQNoiZeA0Z/view?usp=drivesdk
575	Real Stage 48	https://drive.google.com/file/d/1DkhDSCpxaNUGlrT380px5cOBmxqpyv-F/view?usp=drivesdk
587	Real Stage 48	https://drive.google.com/file/d/1VMV403lqf8Mewe9T-mBugVgE4NUCeoPZ/view?usp=drivesdk
982	Real Stage 48	https://drive.google.com/file/d/1uFMRjLEbKPhY8t5Ko7VMI9KPvr1-FFf4/view?usp=drivesdk
956	Real Stage 48	https://drive.google.com/file/d/1lFjG_rdSzhpZBqMYxM6YUMCFqulkYqm0/view?usp=drivesdk
1088	Real Stage 48	https://drive.google.com/file/d/1OyUMWMh5Eo9KytYS3bojAcMP45M6-NSQ/view?usp=drivesdk
1003	Real Stage 48	https://drive.google.com/file/d/1fSqbZ0brqU_V4ZpUYlVdgXmjrDU5mP1e/view?usp=drivesdk
1017	Real Stage 48	https://drive.google.com/file/d/1bXGhBZoqb8rAPG3F3gCKmlpj_aOfcu4P/view?usp=drivesdk
90100140	Real Stage 48	https://drive.google.com/file/d/1HrI2-6K-24bpfOIG4Xi9geYhovjZN-oF/view?usp=drivesdk
90100114	Real Stage 48	https://drive.google.com/file/d/1bKCmSs7844uOkZJi5VLfSpk9F5p5K3HN/view?usp=drivesdk
70100041	Real Stage 48	https://drive.google.com/file/d/1XB-i-PDcQ9eKDChQGVaSrG-sW4naCa-0/view?usp=drivesdk
761	Real Stage 48	https://drive.google.com/file/d/13kTC_7eVDEx9sDgU94KkEEIE2HwzAxZp/view?usp=drivesdk
602	Real Stage 48	https://drive.google.com/file/d/1ELC7ojETTLRs0WbHevjoEsX1rk9uTk1H/view?usp=drivesdk
645	Real Stage 48	https://drive.google.com/file/d/1HPeB5xdxZfo_hxdBrUZQCSw33bAtyFdR/view?usp=drivesdk
66	Real Stage 49	https://drive.google.com/file/d/15uC7PSOicVWzKmJ1d4u6Tk_ICt3XiC9I/view?usp=drivesdk
51	Real Stage 49	https://drive.google.com/file/d/1XxYeTMOR2ab1U8MXXtYAo9iSMj4IpQUK/view?usp=drivesdk
307	Real Stage 49	https://drive.google.com/file/d/1Z0zB63WImdItjbgrFdMNvz9M_W83jowh/view?usp=drivesdk
632	Real Stage 49	https://drive.google.com/file/d/1HceOuUvnRMTZpgk5zKSjq_3jliCJ4856/view?usp=drivesdk
429	Real Stage 49	https://drive.google.com/file/d/122qM6RiWZpGTk8Ngi9B2tJ0VnPNxBsyv/view?usp=drivesdk`;

async function main() {
  console.log('🚀 Importing Real Stage data into portal_trainee & login_trainee...');

  const lines = rawData.split('\n').map(l => l.trim()).filter(Boolean);
  const entries = [];
  const skipped = [];

  for (const line of lines) {
    // Split by tab
    const parts = line.split('\t').map(p => p.trim());
    const id = parts[0];
    const url = parts[parts.length - 1];
    
    if (!id || !url || !url.startsWith('http')) {
      skipped.push({ id, line });
      continue;
    }
    entries.push({ id, url });
  }

  // Deduplicate: keep the LATEST (last occurrence) URL per trainee ID
  const latestMap = new Map();
  for (const e of entries) {
    latestMap.set(e.id, e.url);
  }

  console.log(`📌 Total raw entries parsed: ${entries.length}`);
  console.log(`📌 Unique Trainee IDs (deduplicated): ${latestMap.size}`);
  if (skipped.length > 0) {
    console.log(`⚠️  Skipped ${skipped.length} entries (no ID or no URL)`);
  }

  let portalUpdated = 0;
  let loginUpserted = 0;

  for (const [id, url] of latestMap.entries()) {
    // 1. Upsert portal_trainee with real_stage_report_url
    await db.query(`
      INSERT INTO portal_trainee (trainee_id, real_stage_report_url, updated_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (trainee_id) DO UPDATE SET
        real_stage_report_url = EXCLUDED.real_stage_report_url,
        updated_at = CURRENT_TIMESTAMP;
    `, [id, url]);
    portalUpdated++;

    // 2. Upsert login_trainee (SML + ID)
    const plainPassword = `SML${id}`;
    const hash = await bcrypt.hash(plainPassword, 10);
    await db.query(`
      INSERT INTO login_trainee (student_id, password, plain_password, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (student_id) DO UPDATE SET
        password = EXCLUDED.password,
        plain_password = EXCLUDED.plain_password,
        updated_at = CURRENT_TIMESTAMP;
    `, [id, hash, plainPassword]);
    loginUpserted++;
  }

  console.log('\n🎉 SUCCESSFUL REAL STAGE IMPORT:');
  console.log(`- portal_trainee records updated (real_stage_report_url): ${portalUpdated}`);
  console.log(`- login_trainee accounts upserted: ${loginUpserted}`);

  // Final verification
  const portalCount = await db.query('SELECT COUNT(*) FROM portal_trainee');
  const rsCount = await db.query('SELECT COUNT(*) FROM portal_trainee WHERE real_stage_report_url IS NOT NULL');
  const loginCount = await db.query('SELECT COUNT(*) FROM login_trainee');

  console.log('\n📊 Final Database Verification:');
  console.log(`- Total rows in portal_trainee: ${portalCount.rows[0].count}`);
  console.log(`- Trainees with real_stage_report_url: ${rsCount.rows[0].count}`);
  console.log(`- Total rows in login_trainee: ${loginCount.rows[0].count}`);

  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

const bcrypt = require('bcryptjs');
const db = require('./src/db/neonClient');

// Raw data parsed directly from user message
const rawData = [
  { id: '70100036', url: 'https://drive.google.com/file/d/1yXipY4t0jFT0dnhKH99H5U0V-Q2wPzHL/view?usp=drivesdk' },
  { id: '863', url: 'https://drive.google.com/file/d/1bu8TSomnpKx6djPFnHq61-pwra5SqXir/view?usp=drivesdk' },
  { id: '753', url: 'https://drive.google.com/file/d/1NJGlCu0yHpOoS9f13wG8p9dmLMCxk2vg/view?usp=drivesdk' },
  { id: '70100039', url: 'https://drive.google.com/file/d/1RSKeBIZG0jL4bGkILhznGyS6JkTC7E-4/view?usp=drivesdk' },
  { id: '70100004', url: 'https://drive.google.com/file/d/1A-XlTGEd-TiYZBkr4P3x6bWsL6MTCx0q/view?usp=drivesdk' },
  { id: '70100038', url: 'https://drive.google.com/file/d/1irSFfeItWOKk77yIpR7YLvsIZFFHd9QA/view?usp=drivesdk' },
  { id: '845', url: 'https://drive.google.com/file/d/18quRWD6O-mPxKXZZgqnjjZQFlkJJY7Fa/view?usp=drivesdk' },
  { id: '638', url: 'https://drive.google.com/file/d/11iRgXaLbwRw4kIDTD1RAKdLguX2gNfGm/view?usp=drivesdk' },
  { id: '587', url: 'https://drive.google.com/file/d/17rK0T1Opb15zKZS6WS9Db5ZJvBEhJfxo/view?usp=drivesdk' },
  { id: '736', url: 'https://drive.google.com/file/d/1HdP2HXjvry-HcRhDy0f_bw8CrQWiXkA7/view?usp=drivesdk' },
  { id: '592', url: 'https://drive.google.com/file/d/1IFcYgxIwz45KYmYsYXJMrhkO5mfDdSUY/view?usp=drivesdk' },
  { id: '543', url: 'https://drive.google.com/file/d/10Yg7NwgOf9mVHmZ0Y-djJ8WImfWsBwSI/view?usp=drivesdk' },
  { id: '472', url: 'https://drive.google.com/file/d/1jbnUWORnxw0MCWvXEiOeLeYzSo2-JGTJ/view?usp=drivesdk' },
  { id: '621', url: 'https://drive.google.com/file/d/1ui8I2Fznipg3fFnuB859zfR8EWPoAytW/view?usp=drivesdk' },
  { id: '443', url: 'https://drive.google.com/file/d/13rpJHd_dRww8Ymf2aHtIk4x4ACTmrDgc/view?usp=drivesdk' },
  { id: '521', url: 'https://drive.google.com/file/d/1sTT0CN4sIEFFXNocprO-AJta6x4-n8HG/view?usp=drivesdk' },
  { id: '848', url: 'https://drive.google.com/file/d/1cFSPO_lHRPLqw8WeegJnXfHaKrmYL1tr/view?usp=drivesdk' },
  { id: '841', url: 'https://drive.google.com/file/d/1IcZExxhZfioISgZWIMB6YqOys3IhWFNd/view?usp=drivesdk' },
  { id: '850', url: 'https://drive.google.com/file/d/1LwWGykwks7yYzdSscCYbU0YkS5-W1Tij/view?usp=drivesdk' },
  { id: '569', url: 'https://drive.google.com/file/d/1WAVu8Fc6JbQjoN35SsQa5-eWKGgZxIeS/view?usp=drivesdk' },
  { id: '442', url: 'https://drive.google.com/file/d/19UiZBHUlUlKl4F9Rten8DgHYCxg3bICZ/view?usp=drivesdk' },
  { id: '861', url: 'https://drive.google.com/file/d/1yoOBMT53oUdpi5f-MxD5oxStNhjUoVa8/view?usp=drivesdk' },
  { id: '862', url: 'https://drive.google.com/file/d/1t6cDwuu1Qw6kx_Z1agdLlnHDnnYzoGHb/view?usp=drivesdk' },
  { id: '70100002', url: 'https://drive.google.com/file/d/1pzRm8ELAykTL0mbC-N8biJI8l3w8xHmV/view?usp=drivesdk' },
  { id: '70100046', url: 'https://drive.google.com/file/d/1YwzK3jQbu0dvC6T_c2Px-Bwc-BcdgerN/view?usp=drivesdk' },
  { id: '70100019', url: 'https://drive.google.com/file/d/1vpjx5hJ-VyZudPG2qHP-3cF8BKRUbiTG/view?usp=drivesdk' },
  { id: '70100020', url: 'https://drive.google.com/file/d/1HnK1w0VJqS8FxyQ61uiWUKVt0Jo6PbjG/view?usp=drivesdk' },
  { id: '70100042', url: 'https://drive.google.com/file/d/1YyeAGb33-O5_pulVL0ZWb3HvO9VVBTpN/view?usp=drivesdk' },
  { id: '70100003', url: 'https://drive.google.com/file/d/14J1deFUF9iFGW-G4UYGB1M6CGXs6yG_Z/view?usp=drivesdk' },
  { id: '70100001', url: 'https://drive.google.com/file/d/1JNxrIHI3m9DQ4EteoV_Sydmt0ddRN9L_/view?usp=drivesdk' },
  { id: '70100005', url: 'https://drive.google.com/file/d/1gJJCpjZmKwEPm_caOoIV9_pxGcLSrY_X/view?usp=drivesdk' },
  { id: '70100021', url: 'https://drive.google.com/file/d/1U4qAV21_NyPgYlt0vFQABA50f34ctbcp/view?usp=drivesdk' },
  { id: '661', url: 'https://drive.google.com/file/d/1AOeSj38UDyfj5Y3hzm3YmBlhYxVNyCsw/view?usp=drivesdk' },
  { id: '796', url: 'https://drive.google.com/file/d/1OubiMRCPMJ1cIdkLbtX6-v6ZeOr1-2SA/view?usp=drivesdk' },
  { id: '700', url: 'https://drive.google.com/file/d/1uDKMO6JisosSJINV689NYvzHqxAmABtR/view?usp=drivesdk' },
  { id: '701', url: 'https://drive.google.com/file/d/1jjJ1l117YVBz56619AABlO4d72R2vRM7/view?usp=drivesdk' },
  { id: '588', url: 'https://drive.google.com/file/d/1A-fCtcBWWQw7d3Y14vc1qczCmz6qZTnj/view?usp=drivesdk' },
  { id: '44', url: 'https://drive.google.com/file/d/15kbJ8KM2_MzZxkdxtbyeLWAJjJMkPhtJ/view?usp=drivesdk' },
  { id: '63', url: 'https://drive.google.com/file/d/1yPf78I6FgzgSuyjrZzGnF8enyhPwo59h/view?usp=drivesdk' },
  { id: '67', url: 'https://drive.google.com/file/d/1ALy43NIJaUc_YW5DLs8-9XyUx6Vi4Zf-/view?usp=drivesdk' },
  { id: '96', url: 'https://drive.google.com/file/d/18LiaATrxzp2iQTFoz7MLLTLEBbNKLFhw/view?usp=drivesdk' },
  { id: '70100027', url: 'https://drive.google.com/file/d/1C7AtXnsnVEvwvFVA0M8X8Pz-RLK51h0n/view?usp=drivesdk' },
  // Real Stage 39
  { id: '855', url: 'https://drive.google.com/file/d/1GAEh1kW0WRmHLh4mQcscyzFu8qDuLIuF/view?usp=drivesdk' },
  { id: '604', url: 'https://drive.google.com/file/d/1rI38ZR00cU3pcKXi_ZwhO39fsz__x-0a/view?usp=drivesdk' },
  { id: '865', url: 'https://drive.google.com/file/d/1dG-StioVfU7o-n94SjNkjbNgxI34yICz/view?usp=drivesdk' },
  { id: '827', url: 'https://drive.google.com/file/d/1mQr56-sXiMCSIeuNH-tHowMNY_IFhMEy/view?usp=drivesdk' },
  { id: '70100028', url: 'https://drive.google.com/file/d/13bjdeKEVER-KVcFCcl0oE_S4Rkh3bX-8/view?usp=drivesdk' },
  { id: '868', url: 'https://drive.google.com/file/d/1RSwRsZcemi73JbEulGM3_FT6Jw_2EgSk/view?usp=drivesdk' },
  { id: '889', url: 'https://drive.google.com/file/d/1zTasbUtzJOjncrnEkp9sD6MraQQ8HoZQ/view?usp=drivesdk' },
  { id: '852', url: 'https://drive.google.com/file/d/1p5YCBhm_QXs_aCxnvcV5e3pnGG3V7GUg/view?usp=drivesdk' },
  { id: '70100006', url: 'https://drive.google.com/file/d/1Cn1WU2JpaFu2KTnCooeu37tyCFxgOICI/view?usp=drivesdk' },
  { id: '70100035', url: 'https://drive.google.com/file/d/15A3XvIIShh3nLwV3S3umbquQpseNmy-o/view?usp=drivesdk' },
  { id: '603', url: 'https://drive.google.com/file/d/1dt-RoW5hRmxtbFT_9UJWhzPCRupIIiRo/view?usp=drivesdk' },
  { id: '560', url: 'https://drive.google.com/file/d/1QiGWJX69CjuYHIO9Fio0KD5EkLkplQQL/view?usp=drivesdk' },
  { id: '709', url: 'https://drive.google.com/file/d/13UGrt25pZy78Ab7hInKY8TLTBeJTCJbV/view?usp=drivesdk' },
  { id: '130', url: 'https://drive.google.com/file/d/1Jp_0WuZyqCrh6x1aThT7EtEVEqWO1Wpw/view?usp=drivesdk' },
  { id: '70100057', url: 'https://drive.google.com/file/d/1trFBzzYvB8R-Npv6EusyFbRnmpQCbw3Q/view?usp=drivesdk' },
  { id: '785', url: 'https://drive.google.com/file/d/13yHV-QTQAykiaHUVYqGShTdSBogyrlum/view?usp=drivesdk' },
  { id: '872', url: 'https://drive.google.com/file/d/162PYfGnBPjdwzkC_iZtoZVmNSYQDniDX/view?usp=drivesdk' },
  { id: '70100047', url: 'https://drive.google.com/file/d/1S1xV7jfkzfjhWhpIu1w8diqIsPDSdsrX/view?usp=drivesdk' },
  { id: '677', url: 'https://drive.google.com/file/d/1TJCOp5p-FACviNZJclc6DV_95iA5XSW_/view?usp=drivesdk' },
  { id: '70100041', url: 'https://drive.google.com/file/d/1ckkBp557_9CQqGlVYrNDtXuGtqfihcAh/view?usp=drivesdk' },
  { id: '840', url: 'https://drive.google.com/file/d/1Nt312Dt9uz5qxZ8iQ4dNYThIc-8IP4Sx/view?usp=drivesdk' },
  { id: '839', url: 'https://drive.google.com/file/d/1zul5POeSqOoNy5Pj4dIV51-hAqRfPlOQ/view?usp=drivesdk' },
  { id: '880', url: 'https://drive.google.com/file/d/1MpK5v-wcDnqxr4CpxwqB3c7l73PQlqey/view?usp=drivesdk' },
  { id: '70100059', url: 'https://drive.google.com/file/d/13Am1aas2rL2My2UTH0uJ6gZYfyzsW8Q9/view?usp=drivesdk' },
  { id: '801', url: 'https://drive.google.com/file/d/1zSt-J6EnufwWJAhtJsSvZKUDI5pjyVOx/view?usp=drivesdk' },
  { id: '445', url: 'https://drive.google.com/file/d/1YRsW4NBIm_U9kdbjALrwSOsgUtoLWS1z/view?usp=drivesdk' },
  { id: '803', url: 'https://drive.google.com/file/d/13fKWMD7Pg7wXbH4OAiVQb2QSZuk--yAe/view?usp=drivesdk' },
  { id: '410', url: 'https://drive.google.com/file/d/1fRTAJnXRVV33sMY--CFD0B_4TvXda8cM/view?usp=drivesdk' },
  // 44 appears again for stage 39
  // { id: '44', url: 'https://drive.google.com/file/d/1a-1daCMQrCUJfpT6jrpx9Ciq6dI04T40/view?usp=drivesdk' },
  // { id: '63', url: 'https://drive.google.com/file/d/1m1FfgHepLdiVHPQx4xjSW2_FXHHTRD6h/view?usp=drivesdk' },
  // Real Stage 40
  { id: '866', url: 'https://drive.google.com/file/d/1rDX3AUPC4VznG9n0EKgaQepprNyuceUl/view?usp=drivesdk' },
  { id: '867', url: 'https://drive.google.com/file/d/1mEXr77NT87eM5jkgijstpBAKvPPe9zlH/view?usp=drivesdk' },
  { id: '876', url: 'https://drive.google.com/file/d/1OSzjjBuTKKh6Djx2_fjkBxbqDipB8hEh/view?usp=drivesdk' },
  { id: '740', url: 'https://drive.google.com/file/d/19fs26pvA_a-gT-R9voYPuEpAD0ayOofS/view?usp=drivesdk' },
  { id: '582', url: 'https://drive.google.com/file/d/1-WkUPpPgXecFF55nWzfdKLziTe1-O7Dv/view?usp=drivesdk' },
  // { id: '445', url: 'https://drive.google.com/file/d/11NDARS2lxKLfv07F72LhbIEYpntkr33E/view?usp=drivesdk' },
  { id: '858', url: 'https://drive.google.com/file/d/1zShGJYWxvaLIcz40LOM6EIZedkM83EbO/view?usp=drivesdk' },
  { id: '899', url: 'https://drive.google.com/file/d/1S_l6peisfv_gw-YsqyI3lovJjBulDKiY/view?usp=drivesdk' },
  { id: '70100078', url: 'https://drive.google.com/file/d/10qcyiTRGdtiz9yL0CD3EbL7dwNAR94Uw/view?usp=drivesdk' },
  { id: '900', url: 'https://drive.google.com/file/d/15_-j6kLBh4eYo_BnLXIxc1gGBJUdNR5H/view?usp=drivesdk' },
  { id: '719', url: 'https://drive.google.com/file/d/1tjtluOtvgqPX_Zwp2-OIoszeAI_QYBO9/view?usp=drivesdk' },
  { id: '125', url: 'https://drive.google.com/file/d/136gQkd1K86t-XPp6KfGdqTd-ucQRmrdP/view?usp=drivesdk' },
  { id: '566', url: 'https://drive.google.com/file/d/17U947wAL64IauO9vZWQXWJSc5MkwWQVQ/view?usp=drivesdk' },
  { id: '600', url: 'https://drive.google.com/file/d/1Vqm97WhMjMh9XJsBDuaUuhBg8__SUBMT/view?usp=drivesdk' },
  { id: '375', url: 'https://drive.google.com/file/d/1ca6xOAIE0B4_Y6ncdsSddjPOBdaZyJKZ/view?usp=drivesdk' },
  { id: '545', url: 'https://drive.google.com/file/d/1TMb8znTnoVYO7ykDbpFdnJT51V2SjLQm/view?usp=drivesdk' },
  { id: '333', url: 'https://drive.google.com/file/d/1NjEXTyV0KK-ahYE9Jex_iONjfa4R_flp/view?usp=drivesdk' },
  { id: '48', url: 'https://drive.google.com/file/d/1cZhkbsDwB5DsSSIKiuzuu-ZGqZZWwiS7/view?usp=drivesdk' },
  { id: '896', url: 'https://drive.google.com/file/d/1tTSC1d71jnkLRzFN72qgBZjE_IZtZ6VM/view?usp=drivesdk' },
  { id: '679', url: 'https://drive.google.com/file/d/1wa-6BxPRAGGxWis4RA1BiyjAFu4ReSpI/view?usp=drivesdk' },
  { id: '676', url: 'https://drive.google.com/file/d/15iV4fSFHWP4fg5wPAmp1e2Aihl5IQ16B/view?usp=drivesdk' },
  { id: '612', url: 'https://drive.google.com/file/d/1R9bVC9dpMmKocsbI8Ew-sDCXYM-Hw3Ar/view?usp=drivesdk' },
  { id: '368', url: 'https://drive.google.com/file/d/1pL-LyvWcKmBjPjUyhYeET_8qeWezP-H1/view?usp=drivesdk' },
  { id: '141', url: 'https://drive.google.com/file/d/1ezxhibYi24OWjR-Mi6SB8R3dBZY18Bjo/view?usp=drivesdk' },
  { id: '307', url: 'https://drive.google.com/file/d/1A0090NrDemOkUzBFaMb8xm1ZOZ3sDDGs/view?usp=drivesdk' },
  // Real Stage 41
  { id: '70100062', url: 'https://drive.google.com/file/d/1Y8ovknSdImVeDvHaSvAtLHNKIPdW_QBC/view?usp=drivesdk' },
  { id: '70100060', url: 'https://drive.google.com/file/d/1-S5yzBynOaWbeVW27V57EaxS9r-tlrtJ/view?usp=drivesdk' },
  { id: '871', url: 'https://drive.google.com/file/d/1rYVX25rVtypTG_D8lOGTQs1eH2PtMBAd/view?usp=drivesdk' },
  { id: '869', url: 'https://drive.google.com/file/d/1YB7Ol6K0BI4qhQtI2pFvHjebwD9jbFdQ/view?usp=drivesdk' },
  { id: '854', url: 'https://drive.google.com/file/d/1KqNrYhmpdyP7a09ZzR2gfYe3k3NDL6lf/view?usp=drivesdk' },
  { id: '735', url: 'https://drive.google.com/file/d/1ExkkYcQCK2moxrtcmFMmzLzf3Qz3c6du/view?usp=drivesdk' },
  { id: '613', url: 'https://drive.google.com/file/d/1jIk4x1SuuLCGHLQ1WE9TRQTOKdeeo5-1/view?usp=drivesdk' },
  { id: '682', url: 'https://drive.google.com/file/d/1LV6uZos20iH-K19v6wg0FBM5cvUYeI8Q/view?usp=drivesdk' },
  { id: '440', url: 'https://drive.google.com/file/d/1oOt9x-N0F_BcrYXe1VmK6AcMycXj333H/view?usp=drivesdk' },
  { id: '618', url: 'https://drive.google.com/file/d/1Pt8p5CTUguxN6ChXUY0q01IUJgzH8pBx/view?usp=drivesdk' },
  { id: '680', url: 'https://drive.google.com/file/d/1iKC-A1okxfEDOoObEI2ecEepid85HEsI/view?usp=drivesdk' },
  { id: '49', url: 'https://drive.google.com/file/d/1IWB3_ogBES8VUke219kMgrQuQ1ZCv8DN/view?usp=drivesdk' },
  { id: '70100023', url: 'https://drive.google.com/file/d/1vhj6hbusbCZBEb05xXtC9b7y2hhVgchl/view?usp=drivesdk' },
  { id: '935', url: 'https://drive.google.com/file/d/1DopIPahd2Eb97NWqlIfZS3BxGUUYmqlc/view?usp=drivesdk' },
  { id: '909', url: 'https://drive.google.com/file/d/1iBy05MtkVxtFPLMuq4GfFua0gSyt7Y9H/view?usp=drivesdk' },
  { id: '895', url: 'https://drive.google.com/file/d/1b0yIZIGhtHABPU9l_KLHCvFBt0MqtaMW/view?usp=drivesdk' },
  { id: '904', url: 'https://drive.google.com/file/d/1GQkNvMpxFTcz5lkkpQ0B_3Q1zNb8rMCb/view?usp=drivesdk' },
  { id: '70100074', url: 'https://drive.google.com/file/d/1la1Xeaw-Z4OMuLyIL3wpj7CVsiVsHIDq/view?usp=drivesdk' },
  { id: '70100052', url: 'https://drive.google.com/file/d/1iRl-5aAQ_S7vUM3y6d4MGNFmYQjdPqsA/view?usp=drivesdk' },
  { id: '897', url: 'https://drive.google.com/file/d/1Hip3OtTP5aIK6QNIj3LPU-Mn-h7b2zbD/view?usp=drivesdk' },
  { id: '70100076', url: 'https://drive.google.com/file/d/1uFS28QdsRQmefEY7dQWOn9sCtUrbVO-B/view?usp=drivesdk' },
  { id: '675', url: 'https://drive.google.com/file/d/1oPNs7KsHUETfKxA5IyQcQdH0ewBU6utq/view?usp=drivesdk' },
  { id: '548', url: 'https://drive.google.com/file/d/1abZoh9c5H_aIS_PQY_IRbSKs81SjvC4k/view?usp=drivesdk' },
  { id: '708', url: 'https://drive.google.com/file/d/1BMXrCKKjLYMeW4oWsIuPP-ooC_A26ZMb/view?usp=drivesdk' },
  { id: '948', url: 'https://drive.google.com/file/d/1Pwocw-x-bdHd400zUyk9pkHrbmeDm539/view?usp=drivesdk' },
  // Real Stage 42
  { id: '911', url: 'https://drive.google.com/file/d/1Bxq7fCVF534px0IpKiCL-0Oy0Vr-x3rK/view?usp=drivesdk' },
  { id: '938', url: 'https://drive.google.com/file/d/1pFNzg_AQDHd95ybCBpdcn25MNvj8aEzj/view?usp=drivesdk' },
  { id: '910', url: 'https://drive.google.com/file/d/1I3y19Gi4A1SKTd4bpZGfwG6It79d6alJ/view?usp=drivesdk' },
  { id: '939', url: 'https://drive.google.com/file/d/1Gp_cXJMnEpn7bb_j5yAFUF545KNcKl8h/view?usp=drivesdk' },
  { id: '913', url: 'https://drive.google.com/file/d/1pDuoCC7eJLaAZ0R2s418OQAL0lLLqi_A/view?usp=drivesdk' },
  { id: '918', url: 'https://drive.google.com/file/d/1Y7dboOp9DEw7mFc2exhc55uMi8ucQCGw/view?usp=drivesdk' },
  { id: '870', url: 'https://drive.google.com/file/d/1yRLVse-OvuewIex8F8Eh8B7nuOAj0ZcD/view?usp=drivesdk' },
  { id: '70100069', url: 'https://drive.google.com/file/d/1TCRb1jO8X2I2bze6nFCOp6mOT903P9VS/view?usp=drivesdk' },
  { id: '70100068', url: 'https://drive.google.com/file/d/1vIh0_FJw-Iyi7KQBmYgcCo_Q5FHeM-n3/view?usp=drivesdk' },
  { id: '90100020', url: 'https://drive.google.com/file/d/1mLRbuiVjK3v80KGlM3RapwW_Fe8Q5mII/view?usp=drivesdk' },
  { id: '90100040', url: 'https://drive.google.com/file/d/1JiWQfTHEbvobL9PY3VPE5PyTkmINHLwE/view?usp=drivesdk' },
  // Real Stage 43
  { id: '90100005', url: 'https://drive.google.com/file/d/1UkuulzE-fExrtFX9SoSPYDJQ76pLxzQ0/view?usp=drivesdk' },
  { id: '90100044', url: 'https://drive.google.com/file/d/1hPxIieOF2jRipaqL0j7GAnBlrVvUkXDG/view?usp=drivesdk' },
  { id: '90100022', url: 'https://drive.google.com/file/d/1KWhe-dmGrwSvE_GZmSxnY-AOPts8rk0d/view?usp=drivesdk' },
  { id: '922', url: 'https://drive.google.com/file/d/1R_joWsdDVMFgq-dYsQ0qbdb7TgZPx-we/view?usp=drivesdk' },
  { id: '888', url: 'https://drive.google.com/file/d/11pozKzpJWWVP4kzekooRjjZqJkgouvL-/view?usp=drivesdk' },
  { id: '70100075', url: 'https://drive.google.com/file/d/11HZz30MvKzQ5PVqSuuipdkJpqSTV8qwB/view?usp=drivesdk' },
  { id: '90100036', url: 'https://drive.google.com/file/d/1rhntwj0WMUtb8JrbDyEkkL3j7FU83sU2/view?usp=drivesdk' },
  { id: '70100081', url: 'https://drive.google.com/file/d/1IIm1o9s82JfCmTHXBDanAyA5ccuO343p/view?usp=drivesdk' },
  { id: '90100010', url: 'https://drive.google.com/file/d/1AQx2e_rk6WJTKkDCWNug83NIrjn_KsE3/view?usp=drivesdk' },
  { id: '902', url: 'https://drive.google.com/file/d/1TaG4bkWugLXpGjfgz8UXccBcAvXKfTGV/view?usp=drivesdk' },
  // Real Stage 44
  { id: '90100011', url: 'https://drive.google.com/file/d/1-kPF6GBIeJpfrhqzqm3DMPeSozh6xtTT/view?usp=drivesdk' },
  { id: '90100004', url: 'https://drive.google.com/file/d/1jn2TppfrUoPIZzLgLhmoagi4oiB6EuNf/view?usp=drivesdk' },
  { id: '601', url: 'https://drive.google.com/file/d/1AbzQY-Os3YSwsAEgFssRnljfI8pAqJIM/view?usp=drivesdk' },
  { id: '149', url: 'https://drive.google.com/file/d/1dtgui0U1avI5HQBidiG5fuf6AK36HuBG/view?usp=drivesdk' },
  { id: '90100013', url: 'https://drive.google.com/file/d/1BGKDzt-o3icpns337br5skOOJtCbV609/view?usp=drivesdk' },
  { id: '958', url: 'https://drive.google.com/file/d/1Nn3ze1Cbfl007Vv15bjcZsa4tV1kaB0w/view?usp=drivesdk' },
  { id: '673', url: 'https://drive.google.com/file/d/1M9IzIfIN1rPGk5USpbfr5CFxSCTzOGjL/view?usp=drivesdk' },
  { id: '70100079', url: 'https://drive.google.com/file/d/1_ku6nmWuftz6b7h9prdfqUkLL3QV-bAL/view?usp=drivesdk' },
  // { id: '803', url: 'https://drive.google.com/file/d/1zTJfCEmGAL8fkphwLbpHItmZ9I_y5WGI/view?usp=drivesdk' },
  { id: '907', url: 'https://drive.google.com/file/d/1RwtSXX0TL22YjqKtieRJHQvTXiMSqTWO/view?usp=drivesdk' },
  { id: '947', url: 'https://drive.google.com/file/d/133h3dJcHr1NgzFQ-W6zSINQIi2aYJYaA/view?usp=drivesdk' },
  // { id: '70100038', url: 'https://drive.google.com/file/d/1gQVVpatOdV0EygUSn9_N61SFGcJlLek4/view?usp=drivesdk' },
  // { id: '70100039', url: 'https://drive.google.com/file/d/1z5WOTiOqJBGIAgqLIA4xNTq4Ivv8thfD/view?usp=drivesdk' },
  { id: '482', url: 'https://drive.google.com/file/d/1_YdJ_D2_5S7Kioey9VYD23RD7XRKBEKC/view?usp=drivesdk' },
  { id: '580', url: 'https://drive.google.com/file/d/1uuS3z5t_k69MWRmb19YzjqbRphmEDayq/view?usp=drivesdk' },
  { id: '90100081', url: 'https://drive.google.com/file/d/1rUPzVlYsHGNBWtO9qSowkksSL-QhSGi1/view?usp=drivesdk' },
  { id: '51', url: 'https://drive.google.com/file/d/1LfMGDkk6Gq8_Z-rEmwoVfeVtehozENEm/view?usp=drivesdk' },
  { id: '539', url: 'https://drive.google.com/file/d/1ceabJ7s8Kc93lrnzladix6CQeOtONVGE/view?usp=drivesdk' },
  // { id: '719', url: 'https://drive.google.com/file/d/1MpW3_W48tnOnpODSz2ubmpYbDMKDyZWt/view?usp=drivesdk' },
  { id: '704', url: 'https://drive.google.com/file/d/1TJWVivoFaeEyNQsUAeKgyHD73coCYFCj/view?usp=drivesdk' },
  // { id: '70100005', url: 'https://drive.google.com/file/d/11_Si0NhUAILADWfkkNUTFOjK0VcLlGHf/view?usp=drivesdk' },
  { id: '70100080', url: 'https://drive.google.com/file/d/1Wsuq-ngDyiRXFXiVyFs4ZLuZ6nXTbWWV/view?usp=drivesdk' },
  { id: '972', url: 'https://drive.google.com/file/d/1w1GnPZ1UNP3c7Txi2AyOHx46TKgSPJ9w/view?usp=drivesdk' },
  // { id: '70100002', url: 'https://drive.google.com/file/d/1KZUkrvoSwn04rGbz8XAYOlXe5jFgPzji/view?usp=drivesdk' },
  // Real Stage 45
  { id: '937', url: 'https://drive.google.com/file/d/1tvJo4THS6ClHkFh8WiDdRtmyaE1ABb1e/view?usp=drivesdk' },
  { id: '90100002', url: 'https://drive.google.com/file/d/1fsn9gpYKv4enuYQBZgtJyL7VwT0HBjGM/view?usp=drivesdk' },
  { id: '90100071', url: 'https://drive.google.com/file/d/1nDrk4yZgT7M1fywMh_9oF_1pmzoe5xO7/view?usp=drivesdk' },
  { id: '707', url: 'https://drive.google.com/file/d/1ITxEhJU3e3aTJyuJOtL4UlV6HsuiIVtv/view?usp=drivesdk' },
  // { id: '896', url: 'https://drive.google.com/file/d/1eR4PU_ZRr4MTwE_VwLHVyYDo1sAldtdp/view?usp=drivesdk' },
  // { id: '801', url: 'https://drive.google.com/file/d/1NGzGit4H9Elxja0w5L1ADvgwUFWA9-5x/view?usp=drivesdk' },
  { id: '681', url: 'https://drive.google.com/file/d/12Jh8Mzn-Z6-FwubwFS6ih8ztitPLsC28/view?usp=drivesdk' },
  { id: '483', url: 'https://drive.google.com/file/d/1ZWWLn7IBNYOYiYGCF_fVGp6qSbmLEUEs/view?usp=drivesdk' },
  { id: '90100045', url: 'https://drive.google.com/file/d/1N8tVlGnOE0HRMENrffUXA8gtl-r9Pn34/view?usp=drivesdk' },
  { id: '955', url: 'https://drive.google.com/file/d/1l67Mp72FDQLYfJX8zd26Fcwqz1tHMjby/view?usp=drivesdk' },
  { id: '951', url: 'https://drive.google.com/file/d/1oV-pp4S29iSGKeJWFCufXYrJZCAyi02b/view?usp=drivesdk' },
  { id: '90100080', url: 'https://drive.google.com/file/d/1XMYJiHQVRhc4XVS_bFUb2flG9LNgF4K_/view?usp=drivesdk' },
  { id: '90100079', url: 'https://drive.google.com/file/d/1qG8U3DwT4W9oYVnEFQc2oUlHaV6oZMWq/view?usp=drivesdk' },
  { id: '857', url: 'https://drive.google.com/file/d/1bYniH9Kz_Fq5pQCJrW-c8p5Ze-F6bmSG/view?usp=drivesdk' },
  // { id: '863', url: 'https://drive.google.com/file/d/1OslQWlIuGwRwae2a-S5CqtmLCoXGMKVI/view?usp=drivesdk' },
  // { id: '889', url: 'https://drive.google.com/file/d/1Y2zx0r2XsygDFNqxr4qyi71D_u8An10Q/view?usp=drivesdk' },
  { id: '70100070', url: 'https://drive.google.com/file/d/1EzxOk90X5Ka4Om3pk9UreHshJ6sDlsVL/view?usp=drivesdk' },
  { id: '815', url: 'https://drive.google.com/file/d/1jW41vyfkLmPzmf2pJfSOxpeRRkqxkvOQ/view?usp=drivesdk' },
  { id: '70100050', url: 'https://drive.google.com/file/d/11I-xwgZkIKXEjAEcIQw2SbgtaAOfZKxR/view?usp=drivesdk' },
  // { id: '676', url: 'https://drive.google.com/file/d/1HL6829-QiQlvnEkqUr9WgTjDeeF74QFD/view?usp=drivesdk' },
  { id: '821', url: 'https://drive.google.com/file/d/11IOEalxgP6YKKQyJ8SQpeJ7ljpH1sdcA/view?usp=drivesdk' },
  // { id: '708', url: 'https://drive.google.com/file/d/1HEULK528jSZjjCguJsvHf6zJQP1tW5tu/view?usp=drivesdk' },
  // Real Stage 46
  { id: '90100056', url: 'https://drive.google.com/file/d/1i9fwz9SA_xyfkeKb3J-S3CB7TTPRiA0f/view?usp=drivesdk' },
  { id: '90100068', url: 'https://drive.google.com/file/d/10QdUV5sJrjyG1bQKfc94qhjWSUpvo0fh/view?usp=drivesdk' },
  { id: '90100072', url: 'https://drive.google.com/file/d/1qlDO5V0j_8F-4d2pmSXennmjADFhSNx4/view?usp=drivesdk' },
  { id: '249', url: 'https://drive.google.com/file/d/1ZzgNxlxcFLxdE5LE3t3OxmCGB9btMo5b/view?usp=drivesdk' },
  { id: '490', url: 'https://drive.google.com/file/d/1GkKoSPCquAifRAT7N0i2zdlrKMliEBYr/view?usp=drivesdk' },
  // { id: '70100076', url: 'https://drive.google.com/file/d/1SQWPdWKv5tgpdx34KZIY6xxrOZILiwuV/view?usp=drivesdk' },
  // { id: '709', url: 'https://drive.google.com/file/d/1tcK_BYUbwmoxVDo_NeM70z-YaE8LMENG/view?usp=drivesdk' },
  { id: '152', url: 'https://drive.google.com/file/d/1X64nqUtCcHtzYitD1CbJARvIN-jd4NYC/view?usp=drivesdk' },
  { id: '60', url: 'https://drive.google.com/file/d/1EBCdyxWAijDpzwZY_FAwLLFh4qK_ijH1/view?usp=drivesdk' },
  { id: '70100106', url: 'https://drive.google.com/file/d/1zpD7PRfTOeUXNcHUegTlGzgDvyMWDkWu/view?usp=drivesdk' },
  { id: '70100077', url: 'https://drive.google.com/file/d/1d0e8CKXU-SGo877uvugTl00dMzFiPvX9/view?usp=drivesdk' },
  { id: '90100047', url: 'https://drive.google.com/file/d/1FtwFMN9adRqAc8g1o052-YZZr7LXq0UL/view?usp=drivesdk' },
  { id: '90100067', url: 'https://drive.google.com/file/d/1HXCIW8IeNu0af1cYX_iTK31RHBrauLlS/view?usp=drivesdk' },
  { id: '90100033', url: 'https://drive.google.com/file/d/1OfHggAowKa5Jh29BU0UHrg1X21pzQ5wP/view?usp=drivesdk' },
  { id: '70100090', url: 'https://drive.google.com/file/d/1yh8KN40Y4WqE6ZkKnw03dMMLVwVgrfWV/view?usp=drivesdk' },
  { id: '90100024', url: 'https://drive.google.com/file/d/1tyKoWLRO3CDpzf7mkcYoKOolqKCHGbAR/view?usp=drivesdk' },
  { id: '970', url: 'https://drive.google.com/file/d/17FEk97M_8WB9daNFp_ItASPp6GnB4MeS/view?usp=drivesdk' },
  { id: '90100060', url: 'https://drive.google.com/file/d/1NAFsOHaUAnhg24QSulA5PaAgCFcjVGNg/view?usp=drivesdk' },
  { id: '980', url: 'https://drive.google.com/file/d/19Jq5Hnoro-lH6hTVTbCmwglslQT4yyLI/view?usp=drivesdk' },
  { id: '528', url: 'https://drive.google.com/file/d/1UgWwvYs1yKA7w1uCXu3kyNwsxzsjDzaS/view?usp=drivesdk' },
  // id 686 has no URL in the data (skipped)
  { id: '981', url: 'https://drive.google.com/file/d/1KJXNTmb1RhiSGZXSG5rHACXpwsvZcSPb/view?usp=drivesdk' },
  { id: '70100083', url: 'https://drive.google.com/file/d/1GM9oA7Wh04wEPBCYsaLvP2g904piXF78/view?usp=drivesdk' },
  { id: '962', url: 'https://drive.google.com/file/d/1UBILCkuStCpkXHZ998LN1ToYEprxBdCW/view?usp=drivesdk' },
  { id: '90100104', url: 'https://drive.google.com/file/d/1NIrXp6uuw1vxDg8F0qrWJ2vHFx4XmQBn/view?usp=drivesdk' },
  { id: '986', url: 'https://drive.google.com/file/d/1a2gmoN0TUE70kf_RSRrOxZ_LvCZ5g3_P/view?usp=drivesdk' },
  { id: '90100007', url: 'https://drive.google.com/file/d/1nFE4cHnYZY5E7y78GZxIgOFI8YQQadMY/view?usp=drivesdk' },
  { id: '90100083', url: 'https://drive.google.com/file/d/1EF3d-DkE5t8ofq1DGbu0isHAq_UJgMe3/view?usp=drivesdk' },
  { id: '819', url: 'https://drive.google.com/file/d/1z4JRUrZikTQeYCaVbTDUNiH87zm85mJi/view?usp=drivesdk' },
  { id: '739', url: 'https://drive.google.com/file/d/1Aj59rMB2rmLmsxTAbyee7hA-KwyKWMzn/view?usp=drivesdk' },
  { id: '575', url: 'https://drive.google.com/file/d/1vccqS-hEqdA5FdQqkedj9Ll5QIUbyUxx/view?usp=drivesdk' },
  { id: '602', url: 'https://drive.google.com/file/d/1HTNk-VxX1ov1CiNhdI5IqSRFOJ2eo1A9/view?usp=drivesdk' },
  // { id: '70100047', url: 'https://drive.google.com/file/d/1joeD7eLK5Sddwca4NN-3H4iF5MkN6nss/view?usp=drivesdk' },
  // { id: '90100020', url: 'https://drive.google.com/file/d/1w3eSU1sOI0a6jVNyB33r9rAky8SuhUu1/view?usp=drivesdk' },
  // { id: '70100046', url: 'https://drive.google.com/file/d/1AwyvJ8S29LaXPjmSJw1Uk717J_UL8aFX/view?usp=drivesdk' },
  // { id: '872', url: 'https://drive.google.com/file/d/11X9u0fXlWmDPnLDGDPObfRSdCesdr2Y9/view?usp=drivesdk' },
  { id: '581', url: 'https://drive.google.com/file/d/1NU6HiywPWWN5HFmh6q7zCX5rowjtq-6v/view?usp=drivesdk' },
  { id: '745', url: 'https://drive.google.com/file/d/1XfrifKOPRbAytYFLT4cNyBkNVGnZ4pfs/view?usp=drivesdk' },
  { id: '632', url: 'https://drive.google.com/file/d/1Ma0FTFObknh4m8_wcxfVZpvz4Kfa1Jvz/view?usp=drivesdk' },
  // Real Stage 47
  { id: '70100102', url: 'https://drive.google.com/file/d/168U4DdUH2Q_T41KIGZaMulkbkb7FtHn_/view?usp=drivesdk' },
  { id: '1027', url: 'https://drive.google.com/file/d/1zN9BElH1ezw6fI3L-vShwK9qrrHXIN7p/view?usp=drivesdk' },
  // { id: '70100004', url: 'https://drive.google.com/file/d/1e0winsiDAHGEuFn8Z0WbrnHFFJyUiPm0/view?usp=drivesdk' },
  // { id: '865', url: 'https://drive.google.com/file/d/1K6t9dtyT1hK2az-HhKcWq73FzgRjxX8S/view?usp=drivesdk' },
  // { id: '904', url: 'https://drive.google.com/file/d/15f2yv29FUq3K5p_i9sG-a09fefjGA-vJ/view?usp=drivesdk' },
  // { id: '896', url: 'https://drive.google.com/file/d/1ONo3vmxheapyEYn41FzMAqm6VMVbedaS/view?usp=drivesdk' },
  { id: '288', url: 'https://drive.google.com/file/d/1CryswlT3FLyOYna4jUgiuJGnSP3fLfa0/view?usp=drivesdk' },
  // { id: '70100078', url: 'https://drive.google.com/file/d/1R3aCw378CkCizVYlmkHxg-qDQZZ2Ldmx/view?usp=drivesdk' },
  // { id: '152', url: 'https://drive.google.com/file/d/1bnjyT4OLvGXX3W2F_oAHkBeK-bCIQUuB/view?usp=drivesdk' },
  // { id: '333', url: 'https://drive.google.com/file/d/1RbPtSsw1vp2oOU105SU2gZTRKMcUgQlS/view?usp=drivesdk' },
  // { id: '580', url: 'https://drive.google.com/file/d/14Pc65nwVz8SnIMSIijZNPiFUUSKsCFuF/view?usp=drivesdk' },
  // { id: '49', url: 'https://drive.google.com/file/d/1qIzr0IetDKv_amdDjEGMpM155JbfnkW7/view?usp=drivesdk' },
  { id: '932', url: 'https://drive.google.com/file/d/18brELOB-MVtmTb8I2BP2XAHoi8oNvBOX/view?usp=drivesdk' },
  { id: '70100064', url: 'https://drive.google.com/file/d/16t5BdjqcLvuVuakFfIXO3c1mq5NM_I39/view?usp=drivesdk' },
  { id: '1025', url: 'https://drive.google.com/file/d/1gY7Kdy4Gdm1fiCZx7l-UXzAkvfgkEaPo/view?usp=drivesdk' },
  { id: '1015', url: 'https://drive.google.com/file/d/1zWSUY4kQQX2cAasd8gK2NnKFAyu5yUHs/view?usp=drivesdk' },
  { id: '70100112', url: 'https://drive.google.com/file/d/1I8bO0o_QuTT-JhSJ7U_SH8t0xCzU8I6n/view?usp=drivesdk' },
  { id: '984', url: 'https://drive.google.com/file/d/1zawG8IEfc7LCnUTTMhi1r6_hBD1Kv42Y/view?usp=drivesdk' },
  // { id: '70100042', url: 'https://drive.google.com/file/d/16hIMzorsbbJ_BelldzyleUYNoL5nz0Kp/view?usp=drivesdk' },
  // { id: '70100020', url: 'https://drive.google.com/file/d/1AwVR_CuwsBLyVlMfgjt3WiT47-CqZeky/view?usp=drivesdk' },
  // { id: '70100019', url: 'https://drive.google.com/file/d/1351h8Rql9H4UEiYNBkyDpZEZoR8Dmr6h/view?usp=drivesdk' },
  // { id: '70100059', url: 'https://drive.google.com/file/d/1XYOOqJajyZEKbyihcQ1nYiepo_oMWAWu/view?usp=drivesdk' },
  // { id: '575', url: 'https://drive.google.com/file/d/1B_Jwg2yO99fKn18G-Lvt7m4k7XPFMIDQ/view?usp=drivesdk' },
  // { id: '48', url: 'https://drive.google.com/file/d/1Tnri9DjFem9ATOZa11mxTeoWllg2cNNI/view?usp=drivesdk' },
  { id: '45', url: 'https://drive.google.com/file/d/1NvA6u6P88yr5TW-BzwHWTPxsh0n-dFs6/view?usp=drivesdk' },
  // { id: '307', url: 'https://drive.google.com/file/d/1QVk9VtoRO8URf8O_dOwJfnsRn9-N0rPw/view?usp=drivesdk' },
  { id: '988', url: 'https://drive.google.com/file/d/1f37CSB7pbFYfmAM13Tiq8LhF5iL2t7ZH/view?usp=drivesdk' },
  { id: '965', url: 'https://drive.google.com/file/d/1t4KFER4_0cw5yDZAentWGgGyk4sfa3fN/view?usp=drivesdk' },
  { id: '1071', url: 'https://drive.google.com/file/d/1oGGRaDU1tUSwxLVknyvCMSnPAtGrfyg9/view?usp=drivesdk' },
  { id: '90100064', url: 'https://drive.google.com/file/d/1fYrN1ON4ZFOjTqBMIqF-PxMqmziz1fCH/view?usp=drivesdk' },
  { id: '90100097', url: 'https://drive.google.com/file/d/1o8jMiuoLhlvbRGeb7kQAn3vsawLFM52n/view?usp=drivesdk' },
  { id: '27', url: 'https://drive.google.com/file/d/1-STIgfzqfYzLFOPB4KeBr3-zIaE7yu97/view?usp=drivesdk' },
  { id: '429', url: 'https://drive.google.com/file/d/1xTN3vqmZDniy2Dfq6dVupuldJDLRzjUw/view?usp=drivesdk' },
  { id: '70100121', url: 'https://drive.google.com/file/d/1mbwhKnXz9MW7ybic-B8TZ8xq_3QutjGq/view?usp=drivesdk' },
  { id: '1045', url: 'https://drive.google.com/file/d/1Hh0p5YBZren-vuvLISO-0mt5GX7zKJLg/view?usp=drivesdk' },
  { id: '614', url: 'https://drive.google.com/file/d/1dIPwOMgvRt_kVou8SKj-ImWEtMT5zAh3/view?usp=drivesdk' },
  // { id: '852', url: 'https://drive.google.com/file/d/1KsrGbzByNERnc9zwP6li8RAM4wtAcDUp/view?usp=drivesdk' },
  // Real Stage 48
  { id: '70100098', url: 'https://drive.google.com/file/d/1zrQ8csPPC8m2u5yx3oXAVW8Ubvzh3bHS/view?usp=drivesdk' },
  { id: '1034', url: 'https://drive.google.com/file/d/1d9n9xw0RZJr2I3KjhmgzwIZHWhUZNs0H/view?usp=drivesdk' },
  { id: '70100139', url: 'https://drive.google.com/file/d/1feQWO6vRxrmWeWuk5TxxEzjINaozkz7J/view?usp=drivesdk' },
  { id: '1038', url: 'https://drive.google.com/file/d/1SqwUhG2RFFdCVcrmmAcuelgo_eCCG6g-/view?usp=drivesdk' },
  { id: '1058', url: 'https://drive.google.com/file/d/1SO7S_8FtMihPgQT3r8RmJgsr9SNcuRbg/view?usp=drivesdk' },
  { id: '90100120', url: 'https://drive.google.com/file/d/1PIdyiqOU9haKP7JhB1bUThux6XitjeP5/view?usp=drivesdk' },
  { id: '90100082', url: 'https://drive.google.com/file/d/1VFHUKSVfcyGT1STLAGBE-YnH9GO73mNX/view?usp=drivesdk' },
  // { id: '850', url: 'https://drive.google.com/file/d/192Oxhm2dPPQXbDH7goC-Fsvs4HWX4Bd2/view?usp=drivesdk' },
  // { id: '868', url: 'https://drive.google.com/file/d/1mu8w8E6abdn22Exx5eYaOcGp9fKbgi_b/view?usp=drivesdk' },
  // { id: '680', url: 'https://drive.google.com/file/d/1GJAJvIJwdWpD9b3AABcNwXCvfCPME4Ww/view?usp=drivesdk' },
  // { id: '45', url: 'https://drive.google.com/file/d/1Un8Cty6yjUSZ8O1qTQ7rYA5bzrMEk-pv/view?usp=drivesdk' },
  { id: '573', url: 'https://drive.google.com/file/d/1Z_zCB-OdSkUJF3pyOKYFAE7IqLiCQPAJ/view?usp=drivesdk' },
  { id: '70100051', url: 'https://drive.google.com/file/d/1hgN2icfDOUZ0u9GthcpFYRUzegYMl03M/view?usp=drivesdk' },
  { id: '90100087', url: 'https://drive.google.com/file/d/1pB-tpjjgNxQBdSm6kwGcouzMGpL6YN8k/view?usp=drivesdk' },
  { id: '90100049', url: 'https://drive.google.com/file/d/1_AGw8-PUpsowGl-rmuW1CNFOZdC_m49w/view?usp=drivesdk' },
  { id: '968', url: 'https://drive.google.com/file/d/1n4iodCA8VGbKFz1Cbaj18Z4nXIhbXBOK/view?usp=drivesdk' },
  // one record had no ID before its URL, skipped
  { id: '929', url: 'https://drive.google.com/file/d/1Jaagy4WG7v4U_0p0CFnWn6lLENaswrlo/view?usp=drivesdk' },
  { id: '1041', url: 'https://drive.google.com/file/d/1uBEmfftMbxX-PVDhKmnqbbYv6zZKi5g8/view?usp=drivesdk' },
  { id: '90100153', url: 'https://drive.google.com/file/d/15b23sSBagixAGxgikKq3CeiBwnBEHh8H/view?usp=drivesdk' },
  { id: '1033', url: 'https://drive.google.com/file/d/1FaTQ3_xix_UtB4Lqn3XzJtLW5219D_rZ/view?usp=drivesdk' },
  { id: '1062', url: 'https://drive.google.com/file/d/1DTgAMAKHZtadJ4TP9ufLsxrw3VCfCo3Z/view?usp=drivesdk' },
  // { id: '880', url: 'https://drive.google.com/file/d/1fNay6LRJOzxaZYUcjstyYzEbf4MCIc6L/view?usp=drivesdk' },
  // { id: '679', url: 'https://drive.google.com/file/d/1jJOaDFR9aKvVP4hFIsGbN0kEsqc_eWDe/view?usp=drivesdk' },
  // { id: '821', url: 'https://drive.google.com/file/d/1OeO3e2NgdWCgQnpVnYjXVAAb-dTbp9La/view?usp=drivesdk' },
  // { id: '443', url: 'https://drive.google.com/file/d/1F725UFx3xe64CWdSaNAaxq-tpyOMInDw/view?usp=drivesdk' },
  { id: '70100063', url: 'https://drive.google.com/file/d/1JhAB4FIpMAYY87GWusj8QM_h-Arll0sy/view?usp=drivesdk' },
  { id: '1020', url: 'https://drive.google.com/file/d/1GAU7CUZn8DOEgFgtL7KoLuxAX2qjYJGe/view?usp=drivesdk' },
  { id: '90100128', url: 'https://drive.google.com/file/d/1h3h2iweNv1c5oMOgO9WTfVwLf85jBl_Q/view?usp=drivesdk' },
  { id: '995', url: 'https://drive.google.com/file/d/16ovprkDbLVlS98bYno6k1rjd4btDY3RP/view?usp=drivesdk' },
  { id: '70100122', url: 'https://drive.google.com/file/d/1pXSBeyfuwVilHiS2gY7yemBiwfbiCmSu/view?usp=drivesdk' },
  // { id: '90100081', url: 'https://drive.google.com/file/d/1pZU8Q2wg4h1QmpNnH1EzCzrv8SA9QdrG/view?usp=drivesdk' },
  // { id: '70100028', url: 'https://drive.google.com/file/d/1dKak4UuBzmubb46ufPckjuItmOGNh7E0/view?usp=drivesdk' },
  // { id: '70100062', url: 'https://drive.google.com/file/d/1Ig-4IBgqFJDHnbpKgjFCMutQNoiZeA0Z/view?usp=drivesdk' },
  // { id: '575', url: 'https://drive.google.com/file/d/1DkhDSCpxaNUGlrT380px5cOBmxqpyv-F/view?usp=drivesdk' },
  // { id: '587', url: 'https://drive.google.com/file/d/1VMV403lqf8Mewe9T-mBugVgE4NUCeoPZ/view?usp=drivesdk' },
  { id: '982', url: 'https://drive.google.com/file/d/1uFMRjLEbKPhY8t5Ko7VMI9KPvr1-FFf4/view?usp=drivesdk' },
  { id: '956', url: 'https://drive.google.com/file/d/1lFjG_rdSzhpZBqMYxM6YUMCFqulkYqm0/view?usp=drivesdk' },
  { id: '1088', url: 'https://drive.google.com/file/d/1OyUMWMh5Eo9KytYS3bojAcMP45M6-NSQ/view?usp=drivesdk' },
  { id: '1003', url: 'https://drive.google.com/file/d/1fSqbZ0brqU_V4ZpUYlVdgXmjrDU5mP1e/view?usp=drivesdk' },
  { id: '1017', url: 'https://drive.google.com/file/d/1bXGhBZoqb8rAPG3F3gCKmlpj_aOfcu4P/view?usp=drivesdk' },
  { id: '90100140', url: 'https://drive.google.com/file/d/1HrI2-6K-24bpfOIG4Xi9geYhovjZN-oF/view?usp=drivesdk' },
  { id: '90100114', url: 'https://drive.google.com/file/d/1bKCmSs7844uOkZJi5VLfSpk9F5p5K3HN/view?usp=drivesdk' },
  // { id: '70100041', url: 'https://drive.google.com/file/d/1XB-i-PDcQ9eKDChQGVaSrG-sW4naCa-0/view?usp=drivesdk' },
  { id: '761', url: 'https://drive.google.com/file/d/13kTC_7eVDEx9sDgU94KkEEIE2HwzAxZp/view?usp=drivesdk' },
  // { id: '602', url: 'https://drive.google.com/file/d/1ELC7ojETTLRs0WbHevjoEsX1rk9uTk1H/view?usp=drivesdk' },
  { id: '645', url: 'https://drive.google.com/file/d/1HPeB5xdxZfo_hxdBrUZQCSw33bAtyFdR/view?usp=drivesdk' },
  // Real Stage 49
  { id: '66', url: 'https://drive.google.com/file/d/15uC7PSOicVWzKmJ1d4u6Tk_ICt3XiC9I/view?usp=drivesdk' },
  // { id: '51', url: 'https://drive.google.com/file/d/1XxYeTMOR2ab1U8MXXtYAo9iSMj4IpQUK/view?usp=drivesdk' },
  // { id: '307', url: 'https://drive.google.com/file/d/1Z0zB63WImdItjbgrFdMNvz9M_W83jowh/view?usp=drivesdk' },
  // { id: '632', url: 'https://drive.google.com/file/d/1HceOuUvnRMTZpgk5zKSjq_3jliCJ4856/view?usp=drivesdk' },
  // { id: '429', url: 'https://drive.google.com/file/d/122qM6RiWZpGTk8Ngi9B2tJ0VnPNxBsyv/view?usp=drivesdk' },
];

function getBranch(id) {
  if (id.startsWith('7') && id.length > 4) return 'tritura';
  if (id.startsWith('9') && id.length > 4) return 'cemara';
  const num = parseInt(id, 10);
  if (!isNaN(num) && num >= 1 && num <= 1000) return 'cp';
  return 'cp';
}

async function main() {
  // De-duplicate by ID, keep first occurrence
  const seen = new Set();
  const uniqueData = [];
  for (const row of rawData) {
    if (!seen.has(row.id)) {
      seen.add(row.id);
      uniqueData.push(row);
    }
  }

  console.log(`🚀 Total UNIQUE trainee IDs with Real Stage Report URLs: ${uniqueData.length}`);

  let updatedPortal = 0;
  let updatedLogin = 0;

  for (const { id, url } of uniqueData) {
    const branch = getBranch(id);
    const plainPassword = `SML${id}`;
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    await db.query(`
      INSERT INTO portal_trainee (trainee_id, branch_id, real_stage_report_url, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (trainee_id) DO UPDATE
      SET real_stage_report_url = EXCLUDED.real_stage_report_url,
          branch_id = COALESCE(portal_trainee.branch_id, EXCLUDED.branch_id),
          updated_at = NOW();
    `, [id, branch, url]);
    updatedPortal++;

    await db.query(`
      INSERT INTO login_trainee (student_id, password, plain_password, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (student_id) DO UPDATE
      SET password = EXCLUDED.password,
          plain_password = EXCLUDED.plain_password,
          updated_at = NOW();
    `, [id, hashedPassword, plainPassword]);
    updatedLogin++;
  }

  console.log('--- Summary Results ---');
  console.log(`✅ portal_trainee updated with real_stage_report_url: ${updatedPortal}`);
  console.log(`✅ login_trainee synced:                              ${updatedLogin}`);

  const sample = await db.query(`
    SELECT trainee_id, branch_id, real_stage_report_url
    FROM portal_trainee
    WHERE real_stage_report_url IS NOT NULL
    LIMIT 5;
  `);
  console.log('--- Sample Records ---');
  console.table(sample.rows);
}

main().catch(err => {
  console.error('❌ Import error:', err);
  process.exit(1);
});

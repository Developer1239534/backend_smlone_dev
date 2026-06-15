const db = require('../src/db/neonClient');

const rawData = `
482	Jan - Mar 2023	https://docs.google.com/document/d/1F0ckFecQeQ4cBEFHfQ7X2X8aLUIosEu9YV_n1NARv1Q/edit?usp=drivesdk
49	Jan - Mar 2023	https://docs.google.com/document/d/1SwanyPxIbknfwvrjxDE_7QXlLzePzK9timzsxB2gxek/edit?usp=drivesdk
269	Jan - Mar 2023	https://docs.google.com/document/d/1Nbacm_IjoFhhRD8_H7UpQmcHIYGga1IHB2S1j7ncd_0/edit?usp=drivesdk
285	Jan - Mar 2023	https://docs.google.com/document/d/1nN089H152ZUde7uKobrC4ApFo5DRtdtl4v323q2kOLw/edit?usp=drivesdk
410	Jan - Mar 2023	https://docs.google.com/document/d/1HnwI7EcP2J1khC-ZdK9XfMcjuln2eqljlwFNNKCVV5s/edit?usp=drivesdk
532	Jan - Mar 2023	https://docs.google.com/document/d/1li93GidfbMJIWT8gxw4NSb9EJzGhzvUOM3-GzdjXYv4/edit?usp=drivesdk
545	Jan - Mar 2023	https://docs.google.com/document/d/1JiasehTieY5W7Ll9bMwusT7bmsMBOY8EYirv_czZl70/edit?usp=drivesdk
45	Jan - Mar 2023	https://docs.google.com/document/d/1ofm5glaTmyvCd2iybcPDLIYEDoOcnRBefETl8o5no6c/edit?usp=drivesdk
48	Jan - Mar 2023	https://docs.google.com/document/d/1Csp99yHyllnsKwldV81qXhyIwwRZTVKJLyb94FV8I6g/edit?usp=drivesdk
60	Jan - Mar 2023	https://docs.google.com/document/d/1W-eV-O7PVi7lzACqIcl5hsG7-Hklp9P0YghGzC80NUY/edit?usp=drivesdk
125	Jan - Mar 2023	https://docs.google.com/document/d/1CNIpCZI6Dadib1IdFSthXzdyBWVtUMuRsb4K7qoZF0U/edit?usp=drivesdk
333	Jan - Mar 2023	https://docs.google.com/document/d/1IgJ9l_RCV4RWxLO324gDCA_cYMkdE2RZsbWjM4a5jxg/edit?usp=drivesdk
531	Jan - Mar 2023	https://docs.google.com/document/d/1IOL_ZAwhMNIJ9sUsKtidmhZRw_rQNwOCfJxWVlYBXSI/edit?usp=drivesdk
375	Jan - Mar 2023	https://docs.google.com/document/d/1batPabPP5d6V8oeHl_4ghyO_dDtnq-WXSDCun4LpuQI/edit?usp=drivesdk
440	Jan - Mar 2023	https://docs.google.com/document/d/1MgsK_WrxcRh1wgIs401bLW9qZw6RxviM6Dj8yU632oo/edit?usp=drivesdk
553	Jan - Mar 2023	https://docs.google.com/document/d/1enAG4EZE7O9-CeGXkC45SVEGxRqbXzQ2Y0sCzRJ1Z2w/edit?usp=drivesdk
582	Jan - Mar 2023	https://docs.google.com/document/d/1PkM320h6ulf6x1vSAXJjsPswdffuQM61hACsi5WsojI/edit?usp=drivesdk
575	Jan - Mar 2023	https://docs.google.com/document/d/1IAQs6rKVkUZubQxR2NaPcdmOwm4gKPo5Psigyh3Dzug/edit?usp=drivesdk
136	Jan - Mar 2023	https://docs.google.com/document/d/11GsPZ4FMtsfbi0yV8EabiaTdt8bChN3EUBmaHByy1tE/edit?usp=drivesdk
50	Jan - Mar 2023	https://docs.google.com/document/d/1DxnBF_vMiuGNmUOpSbA-bHSY5OWk0gevs3PvcTbyruc/edit?usp=drivesdk
274	Jan - Mar 2023	https://docs.google.com/document/d/1V0g4nx3uj2m8sbj_SjDxLIoDdxkAcCMB0En645BPZwY/edit?usp=drivesdk
442	Jan - Mar 2023	https://docs.google.com/document/d/1IRF6FI4NFr9eELEVXmeXBe1z34BrDDnbOeZku0yGr-M/edit?usp=drivesdk
443	Jan - Mar 2023	https://docs.google.com/document/d/1THEbyFhlRARBq6TmLs-vYMWyKDJA5TY3K_5FgQEUwb4/edit?usp=drivesdk
483	Jan - Mar 2023	https://docs.google.com/document/d/1-Jt98MD-km6P9vBGaQ7nDP48BlAuPkUGJSqDusvF1RI/edit?usp=drivesdk
548	Jan - Mar 2023	https://docs.google.com/document/d/1s3rGAzK3ulGECLHui0HREBmJOgxJdr4Lnc8Dko3uWSw/edit?usp=drivesdk
566	Jan - Mar 2023	https://docs.google.com/document/d/1pxMyLdmBYpAZEWIhwcmbyNj6jEfMQBoHxbp7Nt3Is7E/edit?usp=drivesdk
581	Jan - Mar 2023	https://docs.google.com/document/d/1rx2azm6_O4pYhgDLFXtsSUPj_2U29tdiZu_9ZIssWjs/edit?usp=drivesdk
585	Jan - Mar 2023	https://docs.google.com/document/d/1mqOjbFmYzNghKay4x85ErIUrkFFoOhfq9_HQs4UGr0I/edit?usp=drivesdk
586	Jan - Mar 2023	https://docs.google.com/document/d/15Tom2tu7dN8nYIWH2EWvjDldAlJpwoCxdgDdQA83HLM/edit?usp=drivesdk
141	Jan - Mar 2023	https://docs.google.com/document/d/1yaOYrrU3CTABhrTS240grC8HxxeiZy97IPB0sNPDuH0/edit?usp=drivesdk
329	Jan - Mar 2023	https://docs.google.com/document/d/1rDNb8qBLZFBB4NHrq2W9UA1_Fl9se63CuqrrQUGwCU0/edit?usp=drivesdk
368	Jan - Mar 2023	https://docs.google.com/document/d/1dtmmyeCSU0z30rH1y4b8modNIUaCtO0QXv9Qslfb96g/edit?usp=drivesdk
301	Jan - Mar 2023	https://docs.google.com/document/d/1DkonIDShHAF9LR4hzbvfWPaVrbO495Sr81oaF1bYiaQ/edit?usp=drivesdk
580	Jan - Mar 2023	https://docs.google.com/document/d/1vpm2iflpoZkebP5uV3cYWgCYcbAGzifyLC6TjVyv1pc/edit?usp=drivesdk
429	Jan - Mar 2023	https://docs.google.com/document/d/1rddV9_NloCUx5u02-RgTvtIEtUWwb2SVO_SN02glM9Q/edit?usp=drivesdk
269	Apr - Jun 2023	https://docs.google.com/document/d/1VkWijZnbq76U8qWvkt1TLgi-UDWdz-K-lzTUlfQGIOg/edit?usp=drivesdk
285	Apr - Jun 2023	https://docs.google.com/document/d/1y-cfVEdO60lDvtIJgUbysoJEVvXDEAP0gePSj3Tc_ho/edit?usp=drivesdk
410	Apr - Jun 2023	https://docs.google.com/document/d/1m3rzcwZgOsoy8PU10yLd3PzBpsVRCsNXLWgAypbHmkw/edit?usp=drivesdk
532	Apr - Jun 2023	https://docs.google.com/document/d/1LWPgBtiECb2999ZYLImzsJTJVcNDswVk_lqm3aimIXc/edit?usp=drivesdk
545	Apr - Jun 2023	https://docs.google.com/document/d/1CF6lyUaE9sxQTHt6RPa5Hi_xNvMrfEoHFApjgFdkTo0/edit?usp=drivesdk
49	Apr - Jun 2023	https://docs.google.com/document/d/1rqZ17I1VRweYLBDd6vX_Y3T6M8TrZn241LolqzPn_Wk/edit?usp=drivesdk
440	Apr - Jun 2023	https://docs.google.com/document/d/1peb1Cy9z1l5neB1APX0pOaIZGgaJJIWo-6f8QzOFcQU/edit?usp=drivesdk
136	Apr - Jun 2023	https://docs.google.com/document/d/1HTk273VKF8XC5wnX8MtbJJZxNK1uVVRXkFj2zoMj_Bw/edit?usp=drivesdk
575	Apr - Jun 2023	https://docs.google.com/document/d/1fHCvVaWkfkOOn0VE12vFtQ422nhVlfs1ritKJb6wc1M/edit?usp=drivesdk
582	Apr - Jun 2023	https://docs.google.com/document/d/1M7Q2mO9bv5JWzuS3M8K6g74-zj2r1t_bepGkp3vl2lE/edit?usp=drivesdk
429	Apr - Jun 2023	https://docs.google.com/document/d/1T-fMPPydjfBWhyELTbTWt7JQflvbMgG-p8a2kok6qJE/edit?usp=drivesdk
141	Apr - Jun 2023	https://docs.google.com/document/d/1JsF82MpgKN_-TYnw2k65YmMKYFG5vrlaxL1X3p6ISbM/edit?usp=drivesdk
329	Apr - Jun 2023	https://docs.google.com/document/d/18r-CQRXcsfQFUwgo2evWfnTlqg_tC6clz9wxLxVr30s/edit?usp=drivesdk
368	Apr - Jun 2023	https://docs.google.com/document/d/1AcpH2zX7P8VaZJEFPbDlNHUGV93CXlFmOU1g7oU0vVs/edit?usp=drivesdk
48	Apr - Jun 2023	https://docs.google.com/document/d/1gmKIj0nX0VtXMLe8FhsdmgAGawnQvFc7ADXJKZNf2kQ/edit?usp=drivesdk
333	Apr - Jun 2023	https://docs.google.com/document/d/1GsN-Nhi4rNO8KBe4kVMUDNDZGhxdHGkYfdBdafEvicc/edit?usp=drivesdk
531	Apr - Jun 2023	https://docs.google.com/document/d/1hNDHPLQOKf2mfVbUcOnRXXlOgCHQLtcsxiQegUCmAZw/edit?usp=drivesdk
482	Apr - Jun 2023	https://docs.google.com/document/d/1Q_oxEbcPOhIKbHCgUb2_79qha52UgBJs2fa2tEmZBR0/edit?usp=drivesdk
45	Apr - Jun 2023	https://docs.google.com/document/d/1iJbae8Rye-lnxUrFiuPMW3id_ptdcq0hQ4eUoEwnAsU/edit?usp=drivesdk
60	Apr - Jun 2023	https://docs.google.com/document/d/1EwRgrGbqGQmXUusN1NGPrSQT_HYJx6RtDU4OwPWtUvM/edit?usp=drivesdk
50	Apr - Jun 2023	https://docs.google.com/document/d/1uFHCSI_O13dBi_3wGMpDTxyxk2Q6d83sXnnH1Af5ak0/edit?usp=drivesdk
274	Apr - Jun 2023	https://docs.google.com/document/d/1TtHb6jyHDOFJLRGH3UvmEIjtunZkr1_K_ksP54ET6sw/edit?usp=drivesdk
301	Apr - Jun 2023	https://docs.google.com/document/d/1kwHIJtZZTZxmJRGp5aN0ndXwtldm8VCOSf-AWcRqCFA/edit?usp=drivesdk
580	Apr - Jun 2023	https://docs.google.com/document/d/1xeVFvhtPk7gLJXT3A5frNm2ceKHrApFUDGfuLmgBJcE/edit?usp=drivesdk
601	Apr - Jun 2023	https://docs.google.com/document/d/1SZJHJy9hpW6NhEjfjvT2PECopyVIMFR7ioGE2M1NCWY/edit?usp=drivesdk
602	Apr - Jun 2023	https://docs.google.com/document/d/1672AAuH1RiqKDlP5CihviOgSnGvC5sC0Fufqi3hISkU/edit?usp=drivesdk
613	Apr - Jun 2023	https://docs.google.com/document/d/1PR6oPXmlnlfWC08G42sBN3DjP5OcXpWLiHYikSsrmdo/edit?usp=drivesdk
614	Apr - Jun 2023	https://docs.google.com/document/d/1iVFmhLdgJPx0ABkHsPw9sKNkqdcZgVMElReoQ92jfUI/edit?usp=drivesdk
125	Apr - Jun 2023	https://docs.google.com/document/d/1f-joi-zVpbcVUMTq5x0sST6g3kuX_v7VsZASIDgzIFg/edit?usp=drivesdk
375	Apr - Jun 2023	https://docs.google.com/document/d/1f0pTp3p8Z41l6CsjKvyK5R2WxQryJC_s_e4BleiuS_g/edit?usp=drivesdk
442	Apr - Jun 2023	https://docs.google.com/document/d/1aNY5ArJSz79ADbr5GRx5pKl4vpCqu1PixZA2AlkVIgU/edit?usp=drivesdk
443	Apr - Jun 2023	https://docs.google.com/document/d/1mywf_xYiuU6tJ8qiFsypwZypUHLYMundi69lKWcLctk/edit?usp=drivesdk
483	Apr - Jun 2023	https://docs.google.com/document/d/1YHotmQLAaS5tJWFgqgfu3bDw_ByxyZP_0yC6pa81aIM/edit?usp=drivesdk
548	Apr - Jun 2023	https://docs.google.com/document/d/1MgLssb-oOmAMvDHOre2fsGPKjsYY75EaJVFNw_56hns/edit?usp=drivesdk
553	Apr - Jun 2023	https://docs.google.com/document/d/12cmBVDM46F8jg78l59VegOteFumnPoZLzQtgilLo_1A/edit?usp=drivesdk
566	Apr - Jun 2023	https://docs.google.com/document/d/1F5kKu5UHZzVpyV1qGcAAkRqwxr4KSEtAQTo3Ymtm3rM/edit?usp=drivesdk
581	Apr - Jun 2023	https://docs.google.com/document/d/1IhKGozmELZNuehcKMK9Uo1SFlGxgTZ2nMve1gEL1cH8/edit?usp=drivesdk
585	Apr - Jun 2023	https://docs.google.com/document/d/1Z7nR6jF46yyH12da5K2GdNhUcQIZ6_XAwrph1Y_t33o/edit?usp=drivesdk
586	July - Sept 2023	https://docs.google.com/document/d/1L4zV50uOQ7SLNWu6GdW1RxgEdIO_89oqAA8an88ga7Y/edit?usp=drivesdk
602	July - Sept 2023	https://docs.google.com/document/d/1XaO_8vOl84Yi2-fVAgWWpBKkC8eKcN97k4d8PxbbKzM/edit?usp=drivesdk
613	July - Sept 2023	https://docs.google.com/document/d/10eemIxIrKqBcv5IrSdgG7bd0o0qU3uT1vjAtuJOPVVs/edit?usp=drivesdk
601	July - Sept 2023	https://docs.google.com/document/d/1bes1DBFmtSSoQ5iFFhJFdfGcbt6d6O3czTyLD60giVU/edit?usp=drivesdk
614	July - Sept 2023	https://docs.google.com/document/d/10PtJ22IgRj-sW9nL9JYIG9FJv2oIMLM6JyWsAl8U2nk/edit?usp=drivesdk
636	July - Sept 2023	https://docs.google.com/document/d/1t0fvpp7ea-jhasksS-SWHQpaRNgIhlVviIMAbkho3TA/edit?usp=drivesdk
676	July - Sept 2023	https://docs.google.com/document/d/1myTqNYuBCCj_Q70CEDTJ3ftQBbK0i3S8eygxuOWJspc/edit?usp=drivesdk
680	July - Sept 2023	https://docs.google.com/document/d/1V0jJ7-B4agrzJ8-Qcb95znm2JzB_qhgrB6rVVG2vb1M/edit?usp=drivesdk
675	July - Sept 2023	https://docs.google.com/document/d/1YS-RRgc7_TRdJ0X4YYk4hlGVhUoAzMI3fgYQsYofZVs/edit?usp=drivesdk
686	July - Sept 2023	https://docs.google.com/document/d/1mT7d07JI6SXZy39Ef60Fv-mlof_pcxAgCDTz8AWYNrw/edit?usp=drivesdk
654	July - Sept 2023	https://docs.google.com/document/d/1XmcuQJ27UsM3flPjNRcyFde4ePYe4NZbS-6LUt1gNlw/edit?usp=drivesdk
683	July - Sept 2023	https://docs.google.com/document/d/1QbgJWYp83nPA7h4xxggmOkX9LOe9SXP73X-P2L0Bt3s/edit?usp=drivesdk
368	July - Sept 2023	https://docs.google.com/document/d/1OodSmYWDb_nz_YS84-EaOLYNf-ZLFSddtd-zhNg1hLo/edit?usp=drivesdk
141	July - Sept 2023	https://docs.google.com/document/d/1HhYHvdmDUvMIldwud3pBYpQPS29Dx51bDJmi9l_2lxI/edit?usp=drivesdk
329	July - Sept 2023	https://docs.google.com/document/d/1UnczcnVY0MwXnib5HoY1U3TMA7uYnPaQsIzAvqkr-8g/edit?usp=drivesdk
301	July - Sept 2023	https://docs.google.com/document/d/1CYVF1kffrGjP2x4mDYZatVwYVMtlEY_YnLtNdMSM0jM/edit?usp=drivesdk
580	July - Sept 2023	https://docs.google.com/document/d/10eSHdXEjcF8Y_E5WcnL5xp60efDhDh6gjbd_Nd09--M/edit?usp=drivesdk
545	July - Sept 2023	https://docs.google.com/document/d/1G5xK-5Ktns-cb-z6nxcLqFILKQtecC-WRGz3-b4yvB0/edit?usp=drivesdk
285	July - Sept 2023	https://docs.google.com/document/d/1aPChm3VRlcON_Ue-wgFuYk9xtnjHXxv9FT6FK7yKANI/edit?usp=drivesdk
410	July - Sept 2023	https://docs.google.com/document/d/1nvs03X-rStPoYgaMqouLtCNj3k6Ox_4x35Wkkyt-1zo/edit?usp=drivesdk
582	July - Sept 2023	https://docs.google.com/document/d/1cackakLV5J4VlOwWMXgiPTYxO_-t4SqlV5Q5lh5z0ew/edit?usp=drivesdk
269	July - Sept 2023	https://docs.google.com/document/d/1SlnU8CBWK-ybQbv6_QdRhhI_JbLrWNDv-A8inwY8ZrE/edit?usp=drivesdk
440	July - Sept 2023	https://docs.google.com/document/d/1BqAHZQNVdfBtGWLn-GjtUyHBX0I1D-rwPo7IPZPEX5I/edit?usp=drivesdk
375	July - Sept 2023	https://docs.google.com/document/d/188XZAVybeAIPhCKRpNABEoDId2cfI4JBhFZUOjVvhP8/edit?usp=drivesdk
587	July - Sept 2023	https://docs.google.com/document/d/1YLbiYJwQffumAvsnV74Lrb432KPcLMoTFk4nKKhDhgQ/edit?usp=drivesdk
125	July - Sept 2023	https://docs.google.com/document/d/1b2GCudXtF985gonRzctLIlkKdUKBEKiWEIf9w4SNkr4/edit?usp=drivesdk
670	July - Sept 2023	https://docs.google.com/document/d/1fDNa3WPfbmtUnqv9xlgdrNuEgknA5ttgeaWrJi81Fg0/edit?usp=drivesdk
633	July - Sept 2023	https://docs.google.com/document/d/1hCOR_3kUyKGzFkpTauX9jvRP-Rdhbuzhoy0kTAysM5o/edit?usp=drivesdk
528	July - Sept 2023	https://docs.google.com/document/d/1EGxvrgTAIaPb7wu9BGtq1qohpWsZBJi_VcnkSnFgxhU/edit?usp=drivesdk
631	July - Sept 2023	https://docs.google.com/document/d/1WuWGpR9gSkl1hsMiwjKPFdVXILMw5lcGe_8YOyblD2E/edit?usp=drivesdk
429	July - Sept 2023	https://docs.google.com/document/d/18-fU4I81PV9rgw8P08nmvWLjGcky1A66DJuQ-5p1Z9g/edit?usp=drivesdk
679	July - Sept 2023	https://docs.google.com/document/d/1wgur4bhlR-cdsVj8qLMhsrF1vnpDG36UFyGnkQ1QpGM/edit?usp=drivesdk
45	July - Sept 2023	https://docs.google.com/document/d/13Qvo5wBY2top2AXMGSeohUnu2b3ESK_TLqeZCz_j2kc/edit?usp=drivesdk
333	July - Sept 2023	https://docs.google.com/document/d/1iewDjrQ_tTFUPd9K23-WkksuZ9Xm6wSYV8yaskQerfE/edit?usp=drivesdk
60	July - Sept 2023	https://docs.google.com/document/d/1kJjUxTKmMaq5EU6VghD0sarDNLUnYkAWMCEVG02KKek/edit?usp=drivesdk
442	July - Sept 2023	https://docs.google.com/document/d/1N1Sem5A_JXZERcA0gt4dqEwvjfpRAD1luRlOhhJTdDM/edit?usp=drivesdk
548	July - Sept 2023	https://docs.google.com/document/d/1DWRnlq5lcrKnDZEnjevs6eQ7wCHA_iHDpIeZEr1ce1w/edit?usp=drivesdk
566	July - Sept 2023	https://docs.google.com/document/d/1PE6iLPBddn8-HbnC6WxakAJkzPAg69NsGp-9QDMXzfE/edit?usp=drivesdk
581	July - Sept 2023	https://docs.google.com/document/d/1sWzR8nXEAqoOCHoUtQ9q-33ngqLCU_lG4pacznUxntE/edit?usp=drivesdk
532	July - Sept 2023	https://docs.google.com/document/d/1g5KlZr-5FURrPajBz2hPZIsoQL87IFRYeN-ngGwuG-I/edit?usp=drivesdk
586	July - Sept 2023	https://docs.google.com/document/d/1V6kQNV2_LyuX_-ipqjQiGM907z2Ow9J5_748rgUOiiM/edit?usp=drivesdk
443	July - Sept 2023	https://docs.google.com/document/d/1IksT57-ErthRYvANxIvG2Ioae84ccPZFWQJ6aeGIdgE/edit?usp=drivesdk
553	July - Sept 2023	https://docs.google.com/document/d/1LhOmt0wIRLHYTaz_ZuWUha-B-_18dlA_rpFyswXp5gk/edit?usp=drivesdk
585	July - Sept 2023	https://docs.google.com/document/d/1c1gKA7IC6UBvx9efzIvCaY0FRjSY108jb4wiq_PpxaY/edit?usp=drivesdk
483	July - Sept 2023	https://docs.google.com/document/d/1_IweGLZ2q1i_E40CjFQuBKk7Z-8K3d5q_XP778SqEDs/edit?usp=drivesdk
50	July - Sept 2023	https://docs.google.com/document/d/1h8hmjXxDGT_h8KntJ7WtzMMndu52Lu3X4GJroUuCc9A/edit?usp=drivesdk
274	July - Sept 2023	https://docs.google.com/document/d/1LuHWYAe0puzT8Rg5ObzwcxZ0T1FOvamF38XEdWuC8uI/edit?usp=drivesdk
48	July - Sept 2023	https://docs.google.com/document/d/1QUa0K6egpJ9Pp6jTLA0BxlJm9ub8sJGHgUE3G0L470g/edit?usp=drivesdk
531	July - Sept 2023	https://docs.google.com/document/d/1l6G74ytqevqdUL1PCPHjCdBcFdG2YgmLHR3B8IiCF-g/edit?usp=drivesdk
49	July - Sept 2023	https://docs.google.com/document/d/1kp-cgO5F6uIhOBfru00yKkz9JjWCMZnjFvDLAqLKmtE/edit?usp=drivesdk
482	July - Sept 2023	https://docs.google.com/document/d/1HDVqjbaazn1Pbnr_29eyB1F-NFAQ8VViPzHVDjejeFs/edit?usp=drivesdk
638	July - Sept 2023	https://docs.google.com/document/d/1NNmvKm47q9JsY1UMdATC9hqR17RMogPha-Z0XhZvWQ0/edit?usp=drivesdk
638	July - Sept 2023	https://docs.google.com/document/d/1tnCMqGMgHntJtXp95U9Y0VgztTRHhYLDBhl1z7OYcIg/edit?usp=drivesdk
136	July - Sept 2023	https://docs.google.com/document/d/1G4ZCIUrMBiZ-1tF0NLGQd532pkIazKBTyXBRLxymPwA/edit?usp=drivesdk
575	July - Sept 2023	https://docs.google.com/document/d/1rrzSettOXp7fwv3OU9mQWjumzYAd2OTpIoY7OLzv7B0/edit?usp=drivesdk
707	July - Sept 2023	https://docs.google.com/document/d/12enBYR4jqcs1qo1umbhhlR7HCg3tMDpm2QZttSBOqAw/edit?usp=drivesdk
429	Oct - Dec 2023	https://docs.google.com/document/d/1vRXX5H6qGl9hHwvu53H2p07hLb0g-W1t3A2-cQyxZ1s/edit?usp=drivesdk
679	Oct - Dec 2023	https://docs.google.com/document/d/1gxzAQMflVSAAR02jn3867TfRXQciSOCnP5OFwzyeK6Q/edit?usp=drivesdk
741	Oct - Dec 2023	https://docs.google.com/document/d/1Sph2yNh81JkbV90K6gvKFmVVkFSBEajnFrGbNczJ1Fc/edit?usp=drivesdk
745	Oct - Dec 2023	https://docs.google.com/document/d/1KegWC2y7wdonbpC8Lr5e3f3q0TxPTe4JZSWV19IWhaM/edit?usp=drivesdk
442	Oct - Dec 2023	https://docs.google.com/document/d/1y6idvnlx6lJOk_4i9lvd3SrmkYxgCkvW8XGp04TIwOY/edit?usp=drivesdk
532	Oct - Dec 2023	https://docs.google.com/document/d/1m2FbTVZMntRtcfKnJzO7DilJYBWCnuM8pvhiL-yUKr4/edit?usp=drivesdk
548	Oct - Dec 2023	https://docs.google.com/document/d/1CJOMxrKhlqcHXQJTNzzpzOXzSI_B1hkxIoQbU1f4Lmw/edit?usp=drivesdk
566	Oct - Dec 2023	https://docs.google.com/document/d/14Vw58RCr0Ha1p-NgIkxwRDx4A-6rZJrJ7qwnyZ9kPds/edit?usp=drivesdk
581	Oct - Dec 2023	https://docs.google.com/document/d/1PF69QbfuMzF4F-t3nPASYZD4Vu8ZLeUEp_AQOwY6Xog/edit?usp=drivesdk
716	Oct - Dec 2023	https://docs.google.com/document/d/1nefROBkP18KZJzyhq3S0NHWNvcoi-wKdXrbzDkkBOFU/edit?usp=drivesdk
602	Oct - Dec 2023	https://docs.google.com/document/d/1codPvkDT8dvgZgurtRn3M1Q1qzaXE2DXCJpTUZJUXHs/edit?usp=drivesdk
613	Oct - Dec 2023	https://docs.google.com/document/d/1_kejh3VS49GVf03H5LvobXZm-oOxswZvNueY9zwr2a8/edit?usp=drivesdk
614	Oct - Dec 2023	https://docs.google.com/document/d/13HQ4cRexzD5hNEeOYg4pN_loWgr2v1CffYQ2I3kpoKg/edit?usp=drivesdk
636	Oct - Dec 2023	https://docs.google.com/document/d/1xIvRrAasNTNY7LiHkYF0UShXjIiJNxuUu3Kj73LWvUg/edit?usp=drivesdk
738	Oct - Dec 2023	https://docs.google.com/document/d/1PXacDlCbMMzKCQ69IXVNh0V0byAj3oDC8ezTlUMGIZQ/edit?usp=drivesdk
740	Oct - Dec 2023	https://docs.google.com/document/d/1M0Pho8ngKM28pZ8nGU-7hQM8PzuhyB_a8H1Swf-qeJA/edit?usp=drivesdk
761	Oct - Dec 2023	https://docs.google.com/document/d/1BVdqaDcuBud6A8bNYG-gA0DblYqty0XUbLcl-BjiSXs/edit?usp=drivesdk
45	Oct - Dec 2023	https://docs.google.com/document/d/1fIgl2sPjwZbV66Ropjw2lFPpSA9CDVhZo6-JvvT8bbU/edit?usp=drivesdk
60	Oct - Dec 2023	https://docs.google.com/document/d/1WdPpsID71VjwUCh7KRx-HkIPgibZEitxG6U9Sfnsm60/edit?usp=drivesdk
333	Oct - Dec 2023	https://docs.google.com/document/d/1gr4AaTmn2KxGxVjUJUEPKTs0fVbecS8JWqs-b8FDvqo/edit?usp=drivesdk
719	Oct - Dec 2023	https://docs.google.com/document/d/1mErAJDkO6ubQrCxvdT75OzN0mCBOtuhpKfQTbOkwa3Y/edit?usp=drivesdk
301	Oct - Dec 2023	https://docs.google.com/document/d/1bkzfCxgWjD21XBoS7usLROkfcC2MwFv3V1yBP_bw8GI/edit?usp=drivesdk
580	Oct - Dec 2023	https://docs.google.com/document/d/1PYLxFmVeBOjbLpzzy7ZP7lBITyYXwB_mrrFaG6sBN1Y/edit?usp=drivesdk
141	Oct - Dec 2023	https://docs.google.com/document/d/1TDPPIPEdfzcb72MM0xWVDnLAvxxIwKT78PROSynuUzs/edit?usp=drivesdk
368	Oct - Dec 2023	https://docs.google.com/document/d/1FSIGur2S8PE3hwGg67lN1rr3Qm-pjSv-i2_eoWElcpg/edit?usp=drivesdk
767	Oct - Dec 2023	https://docs.google.com/document/d/1kgGlWEUzy2Bux6G99YyEXVS4rn7rSgLL7MLGOx8RPmE/edit?usp=drivesdk
50	Oct - Dec 2023	https://docs.google.com/document/d/16b8ED5prSCwX5B4HxzHuQNcS6hzbt4OtqIHZnGN0uf8/edit?usp=drivesdk
443	Oct - Dec 2023	https://docs.google.com/document/d/1F1-5iCku9NhmR2iXt47_gsA2WSVtuUN8SFhykrJzqnc/edit?usp=drivesdk
483	Oct - Dec 2023	https://docs.google.com/document/d/1i_9jmf5g6uXmh0Ok_dk9VrimzctebjoK1hEOXISmjdg/edit?usp=drivesdk
569	Oct - Dec 2023	https://docs.google.com/document/d/1itqwP-L2di2_kDJh9kfg2SxT6yH7MqU5STQcR8Upc3A/edit?usp=drivesdk
717	Oct - Dec 2023	https://docs.google.com/document/d/1ue45BW0Q6xyy_L_ejPVQecljF28Pv8f1GxB0Tl7_nQs/edit?usp=drivesdk
739	Oct - Dec 2023	https://docs.google.com/document/d/13mZxp_mmKd-cK9A30qlTim-CZAXNy5JXRZht5D7LMm8/edit?usp=drivesdk
274	Oct - Dec 2023	https://docs.google.com/document/d/1v0Q66-vd_Rd_4b5K67wgwo1fqXmMYNPqvLhEE2F3Vbw/edit?usp=drivesdk
329	Oct - Dec 2023	https://docs.google.com/document/d/1gpDPaaDvOFI1HKPIBiysmq9cX3DXX7yEbeQiU1ZVNWA/edit?usp=drivesdk
553	Oct - Dec 2023	https://docs.google.com/document/d/10pkTpj4SfMHUR4SkcjFgdtul37BbbUvgk9HU4txGIRY/edit?usp=drivesdk
585	Oct - Dec 2023	https://docs.google.com/document/d/1nNopoSfdc3eUbiniyVN0LP_zDNTtXpYdSL1mxUjqA7U/edit?usp=drivesdk
586	Oct - Dec 2023	https://docs.google.com/document/d/149MiXWiVUQrwqhp9H7fczp8bJ78UjjQpuGLoNn_At4w/edit?usp=drivesdk
654	Oct - Dec 2023	https://docs.google.com/document/d/1bFNsz7D56uuoseyeKIHG4qrCVIzQ-nrTy3weZtzn6Ic/edit?usp=drivesdk
675	Oct - Dec 2023	https://docs.google.com/document/d/1vT2Ms9S0RhozStNEQTCBiamCJxNZDkYF90fzAGNGptU/edit?usp=drivesdk
676	Oct - Dec 2023	https://docs.google.com/document/d/1llT5o7g2541tfolUt7DWKJwISLC-EEEpgMWjteJI9nw/edit?usp=drivesdk
680	Oct - Dec 2023	https://docs.google.com/document/d/1KzVPlnnbtfNid0pmJ5YZG4VjFjXs35wnkPXQI3Lvpdo/edit?usp=drivesdk
683	Oct - Dec 2023	https://docs.google.com/document/d/1FVdjVbsE3TLvmmQGcPkqE8bJGoaoN_rs6s1olrCjoZk/edit?usp=drivesdk
686	Oct - Dec 2023	https://docs.google.com/document/d/1PEIZyLLWbxmQM9KAmCsGaXglxWM0B73gI_GKt3fSJao/edit?usp=drivesdk
751	Oct - Dec 2023	https://docs.google.com/document/d/17UF49kaPOJcdQYBsrDmb0QYOz-irlofeYvXEQ858PoE/edit?usp=drivesdk
754	Oct - Dec 2023	https://docs.google.com/document/d/1GMADVvxLZTuE_7rmWY4tTHGBn-ggjBf1SNQgmkICKhI/edit?usp=drivesdk
125	Oct - Dec 2023	https://docs.google.com/document/d/13QSwe6_09q7WhkDwgevRXcRdC4NPAqTTb1juKn7TxRs/edit?usp=drivesdk
375	Oct - Dec 2023	https://docs.google.com/document/d/1cKyrjwcJhU4mNIFklQlsd7OLb65HO4yFNvNsWtj3QQo/edit?usp=drivesdk
709	Oct - Dec 2023	https://docs.google.com/document/d/1tHDjyln2FGZmluynxbJOlImpxRXh7ZhRIQk4W5W-z0E/edit?usp=drivesdk
759	Oct - Dec 2023	https://docs.google.com/document/d/1qr2jtpR8eHZze_8zUyPs5Xd5-Fylxf53Mv3j5jOF6gY/edit?usp=drivesdk
587	Oct - Dec 2023	https://docs.google.com/document/d/1HlEVxOzq6KXglWzq0kksrUh66oxNDNDUZahye9QDZE8/edit?usp=drivesdk
48	Oct - Dec 2023	https://docs.google.com/document/d/1blzgV1KdsSJj61YfhqAPG2kzHOw0Ql--CnC_HKjl5qo/edit?usp=drivesdk
665	Oct - Dec 2023	https://docs.google.com/document/d/1BsfN-3LD2z3ds5iSq95OTzoPJw_Kc6oO7ztbAKYmTmQ/edit?usp=drivesdk
768	Oct - Dec 2023	https://docs.google.com/document/d/1swtEtLOSUz3Flzmoi_fOVlmGbMncyQFyIDvk6qlYdks/edit?usp=drivesdk
528	Oct - Dec 2023	https://docs.google.com/document/d/1J55K1EqQLhPx52bCI9maO0V7BP3Txst0Ykv-KdhSoeY/edit?usp=drivesdk
631	Oct - Dec 2023	https://docs.google.com/document/d/12GCyH3kvfdlkjtMTRVqUi7eRggIsTvEI7BBgnmGrz84/edit?usp=drivesdk
633	Oct - Dec 2023	https://docs.google.com/document/d/1Tj1U5G5FonYYZpam38hrEs4GH5VPDX9PkJ9_mW-2Npw/edit?usp=drivesdk
670	Oct - Dec 2023	https://docs.google.com/document/d/1J4D8kw5UODUHxP86BednW9Lq5bFlflrwBtvcKS49cv0/edit?usp=drivesdk
704	Oct - Dec 2023	https://docs.google.com/document/d/17pYPFk0BjvjsEKzkebxFMvclQXxM7rCLEGgAX9d9R2k/edit?usp=drivesdk
707	Oct - Dec 2023	https://docs.google.com/document/d/1eImT6MhdGAYS5-piArWvy2kRwCRAcqrCAq7DaMqJtyE/edit?usp=drivesdk
735	Oct - Dec 2023	https://docs.google.com/document/d/18ClI8QpCwhx1SH0cC7uQ3xByRt3Egl0fzE4qDaODjQs/edit?usp=drivesdk
736	Oct - Dec 2023	https://docs.google.com/document/d/10T8Fmu3sbKjNpunxvQAx3h50uvNopv44brUGEJqiTUY/edit?usp=drivesdk
285	Oct - Dec 2023	https://docs.google.com/document/d/1duMVUUQ-gi0WgCIFlJDukqMFl4VaRsvWCYRSOHLYvj0/edit?usp=drivesdk
410	Oct - Dec 2023	https://docs.google.com/document/d/178DUiFt4ClobKkHYyHSF6O3T0XYYNtrGuF4HeGw0aCM/edit?usp=drivesdk
440	Oct - Dec 2023	https://docs.google.com/document/d/1VehNw7gUm6GHdWnqp3vaZYCgQxgmrv2In1idqNyiOhI/edit?usp=drivesdk
545	Oct - Dec 2023	https://docs.google.com/document/d/1h44IR6EfKma4f3NclGef4JlsGsGSeDFPYsLkoKuz4HE/edit?usp=drivesdk
582	Oct - Dec 2023	https://docs.google.com/document/d/1o9F2u-ysnZJCZMvj0G1p60UmmOfSj_an0qnIQC7-NOE/edit?usp=drivesdk
726	Oct - Dec 2023	https://docs.google.com/document/d/1_6swriZl0WZ3wqaixIq1fwgWltk9bUA4VGwveCnY-_4/edit?usp=drivesdk
269	Oct - Dec 2023	https://docs.google.com/document/d/1Pw5sw12qGlfEQsKzhEXGwXUYJ0X49LW5M65c4okFmDw/edit?usp=drivesdk
49	Oct - Dec 2023	https://docs.google.com/document/d/1z56pSBs1gdCsTOQFiCUdWK5Lw-sAMAiIkqHbgcHEXao/edit?usp=drivesdk
482	Oct - Dec 2023	https://docs.google.com/document/d/1rOUuFUvA8_YeP0mlq2WSfagQM_1jfUrjPeU6_8qyclo/edit?usp=drivesdk
`;

async function main() {
  try {
    const lines = rawData.trim().split('\n');
    const records = [];
    const dedupSet = new Set();

    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length < 2) continue;
      const id = parts[0].trim();
      const periode = parts[1].trim();
      const url = parts[2] ? parts[2].trim() : null;

      if (!id || isNaN(id) || !periode) continue;

      const dedupKey = `${id}|||${periode}`;
      if (dedupSet.has(dedupKey)) {
        continue;
      }
      dedupSet.add(dedupKey);

      records.push({ id, periode, url: url || null });
    }

    console.log(`Parsed ${records.length} unique 2023 quarterly report records to seed.`);

    let insertedCount = 0;
    let missingTraineeIds = new Set();

    for (const rec of records) {
      let targetId = rec.id;
      if (targetId === '968') {
        targetId = '966';
      }

      // Check if trainee exists in DB
      const check = await db.query('SELECT 1 FROM dashboard_trainne WHERE id = $1', [targetId]);
      if (check.rows.length === 0) {
        missingTraineeIds.add(rec.id);
        continue;
      }

      // Perform upsert (INSERT ... ON CONFLICT DO UPDATE)
      await db.query(`
        INSERT INTO quarterly_report (trainee_id, periode, url)
        VALUES ($1, $2, $3)
        ON CONFLICT (trainee_id, periode)
        DO UPDATE SET url = EXCLUDED.url;
      `, [targetId, rec.periode, rec.url || '']);
      insertedCount++;
    }

    console.log(`\n=======================================`);
    console.log(`    2023 REPORT SEEDING COMPLETED      `);
    console.log(`=======================================`);
    console.log(`Successfully Upserted: ${insertedCount} records.`);
    console.log(`Missing Trainees (skipped): ${missingTraineeIds.size}`);
    if (missingTraineeIds.size > 0) {
      console.log('Skipped IDs:', Array.from(missingTraineeIds));
    }
    console.log(`=======================================\n`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

main();


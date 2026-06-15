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
45	Jan-Mar 2024	https://docs.google.com/document/d/1iKg9T4IV9JciBpkaJor5Z_7QD_0kJPc6S5hwIjCF1_g/edit?usp=drivesdk
48	Jan-Mar 2024	https://docs.google.com/document/d/16PeCFpnEQ5eCRM0PmAvTcxt5A1-tcOFvgfcpohJzWZY/edit?usp=drivesdk
49	Jan-Mar 2024	https://docs.google.com/document/d/1l0sVYnrDqeXm3VoZVLKMj5oAa8IRABQW6BPLudBIrjg/edit?usp=drivesdk
50	Jan-Mar 2024	https://docs.google.com/document/d/1grHME3fdQSCYfuiQYJ3BvOEEujngy8NU4WP_eWeZuno/edit?usp=drivesdk
60	Jan-Mar 2024	https://docs.google.com/document/d/1U_uAsl9hDck7Htbje-Y4ZK5gz7MV9EybVK3UCnKUHU8/edit?usp=drivesdk
125	Jan-Mar 2024	https://docs.google.com/document/d/16llsdh0S5murcSCWAvM_Tt8yTQFs4MOM4H8Sl_SXIWw/edit?usp=drivesdk
136	Jan-Mar 2024	https://docs.google.com/document/d/1zaZxuytvvQNBh8aqoHtf9N6imWwRsCUOy7hf1JMrNqU/edit?usp=drivesdk
141	Jan-Mar 2024	https://docs.google.com/document/d/1M-vk_4SbuIP3FBaVnq_AYIlMBPMTevHwgxk10iO35es/edit?usp=drivesdk
255	Jan-Mar 2024	https://docs.google.com/document/d/1_feyMRIG_7mYdjNT5vrvFIrlKS4wsLt24lQ_dHg7X38/edit?usp=drivesdk
269	Jan-Mar 2024	https://docs.google.com/document/d/1pRYBeQ4Wn0yQiZJwQ5iaFLV4X6-1pPQn1YfYwFBOwDw/edit?usp=drivesdk
274	Jan-Mar 2024	https://docs.google.com/document/d/1oIMf5eDUyaEcU58yAPZWy86mJvjgzI4qbt7rgDhyENo/edit?usp=drivesdk
285	Jan-Mar 2024	https://docs.google.com/document/d/160h0CckpyZHRS7son914mIQjPLAYsehIZGWBLuwiLd0/edit?usp=drivesdk
301	Jan-Mar 2024	https://docs.google.com/document/d/1_AehaJWR06VtoeJQCf9urNONBXY5OHW_2gFJqQ5Vwcs/edit?usp=drivesdk
329	Jan-Mar 2024	https://docs.google.com/document/d/1S273iFb7rQbE6gClircgpl9Ul5iuhNIZ8q8SdOxlJf4/edit?usp=drivesdk
333	Jan-Mar 2024	https://docs.google.com/document/d/1VU8DdxyVJgS-3W94sFY-6cLQ6VcmgzynZg7IczbmeiY/edit?usp=drivesdk
368	Jan-Mar 2024	https://docs.google.com/document/d/162T585JABiYfMWzOufiwUMn4vHAaTOM7W9-Rx9SFDbo/edit?usp=drivesdk
375	Jan-Mar 2024	https://docs.google.com/document/d/1EwtCxyPCZ5olvb5RdXlJVnJ2FFMKTmrntwetceAqDOk/edit?usp=drivesdk
410	Jan-Mar 2024	https://docs.google.com/document/d/1CvZfLRwVlIaulvjX1nEHiARMoD7Li_lqsKMvYC9nW9c/edit?usp=drivesdk
429	Jan-Mar 2024	https://docs.google.com/document/d/19xcxAUrP4JJwTj_3kMoB7z9UFbRDs1lshtOZB824Sr4/edit?usp=drivesdk
440	Jan-Mar 2024	https://docs.google.com/document/d/1KLxZXldNwg-OLHhROvwGPh8ZxpIW4v0iu12OHLxwYRk/edit?usp=drivesdk
442	Jan-Mar 2024	https://docs.google.com/document/d/1P5ZiHMg6T63rLM-51gfCuTK3cg5k7Q58Ge31Rw3VsD4/edit?usp=drivesdk
443	Jan-Mar 2024	https://docs.google.com/document/d/1_0yK6FYqknJKnbNQpzqtLGymsp1SbNiU1U93UJK8dhw/edit?usp=drivesdk
482	Jan-Mar 2024	https://docs.google.com/document/d/1_LAvs6cDHZ1HzS50uOQdCzJBaCCiK6I3DRu1F6lCR3E/edit?usp=drivesdk
483	Jan-Mar 2024	https://docs.google.com/document/d/1rrU28iGthe9YkT5UA0VFc4Mt_dirEEYfhNHuMKupp4o/edit?usp=drivesdk
490	Jan-Mar 2024	https://docs.google.com/document/d/1sk1oY4_iBkspetzM4Vt3v7IvjFPyNdTN1ARPrj-snhc/edit?usp=drivesdk
528	Jan-Mar 2024	https://docs.google.com/document/d/1sk1oY4_iBkspetzM4Vt3v7IvjFPyNdTN1ARPrj-snhc/edit?usp=drivesdk
528	Jan-Mar 2024	https://docs.google.com/document/d/1e1d1N3TqkSwbXSJ62078U2PR71SsFLPunjS-Eq41i2Y/edit?usp=drivesdk
531	Jan-Mar 2024	https://docs.google.com/document/d/1hFUOdE4Bl87EMO40bFtruiciW8TlKIFBDv8WeaiLemA/edit?usp=drivesdk
532	Jan-Mar 2024	https://docs.google.com/document/d/1AF7baiD3N8bZdUzGrpJrbGcdivzbx7gsNY1n12S1U0w/edit?usp=drivesdk
545	Jan-Mar 2024	https://docs.google.com/document/d/1E8VkiiScCM_X2GN0yyiPVgscuxqRlWHFSZSv6OS5r70/edit?usp=drivesdk
548	Jan-Mar 2024	https://docs.google.com/document/d/1o9GnZvH9uWpqvRkQbsiHvQdfDq2fXa4LJR2kjaps2Lo/edit?usp=drivesdk
553	Jan-Mar 2024	https://docs.google.com/document/d/1CZ63oH92GDQExLnh2wu7-4QTOgP3YyHC4Y0O1pyVdrI/edit?usp=drivesdk
566	Jan-Mar 2024	https://docs.google.com/document/d/1ocB0E4oYYDHZSXRzM3r8HPAK2_OJXoRWcbnTDJ-O8PY/edit?usp=drivesdk
569	Jan-Mar 2024	https://docs.google.com/document/d/1p4eJbYWSn2ubciu60_c3kFhfjPUmrZ_2190ojycVr4c/edit?usp=drivesdk
574	Jan-Mar 2024	https://docs.google.com/document/d/13I9cwckPq2dNoHwdAqmjtE2jaP4jWvCQy9LsraoYqH8/edit?usp=drivesdk
575	Jan-Mar 2024	https://docs.google.com/document/d/1YwhujLSZpxd1YOSnTba1c0an68RncydNUCaUV-8hFAo/edit?usp=drivesdk
580	Jan-Mar 2024	https://docs.google.com/document/d/145CcSek0HVvYs_elNTDVgPshrtVa5aT9lFS62omvha0/edit?usp=drivesdk
581	Jan-Mar 2024	https://docs.google.com/document/d/1xQ7w-l-UyhzIUWeT_i_ZsJVS_qOeFOAbzzFlmy9qvVU/edit?usp=drivesdk
582	Jan-Mar 2024	https://docs.google.com/document/d/1NpdkCqt8GWD39jHYruksNakZGUjakbLy0FM1N-q8DgA/edit?usp=drivesdk
585	Jan-Mar 2024	https://docs.google.com/document/d/1Tw0DEMjzCUmgMsD_IFCc_CzrbBmvhMGaTNeapZxC7yQ/edit?usp=drivesdk
586	Jan-Mar 2024	https://docs.google.com/document/d/1v--BQecil4VI_sEDc7y4QC51_Gl_U3jDENVxQTidsl4/edit?usp=drivesdk
587	Jan-Mar 2024	https://docs.google.com/document/d/1DX5HunU7xTn-SxZZUwl3xl_WsE6ffKrKV2wnrMuGcus/edit?usp=drivesdk
601	Jan-Mar 2024	https://docs.google.com/document/d/1SR-SMGWhz3X_usC0JaxIGunXJ3Dj61VPclzfvcg0HEA/edit?usp=drivesdk
602	Jan-Mar 2024	https://docs.google.com/document/d/1_ruFwrF0l8L8llI2g454AON7DQfeLE-2C1TxInpKjdE/edit?usp=drivesdk
604	Jan-Mar 2024	https://docs.google.com/document/d/1TjfQ3Vy1D19bcnfsxcLxsloqxfcKT7OICMBAbjeT50s/edit?usp=drivesdk
613	Jan-Mar 2024	https://docs.google.com/document/d/12DaqEFOGvjNkhbfVeyygOBwOLDl5P1k3zgj9IXPE93k/edit?usp=drivesdk
614	Jan-Mar 2024	https://docs.google.com/document/d/1L7xr0PpmS2V_tSd7cE6DQ3UK5PKTqeu1PY7TuYDtbt0/edit?usp=drivesdk
625	Jan-Mar 2024	https://docs.google.com/document/d/1vW1FDzP6vBKkMN4u-0u6vIOB-q_tfuL3BPeXvpOjATs/edit?usp=drivesdk
629	Jan-Mar 2024	https://docs.google.com/document/d/15essUlD7w4wMylVcjkfVhkrWeHs82nU1imh6RE0pBik/edit?usp=drivesdk
631	Jan-Mar 2024	https://docs.google.com/document/d/1_NQQZPsfSYWumogzV7HbNCsyssJr1SjdbpgluPgUmzc/edit?usp=drivesdk
633	Jan-Mar 2024	https://docs.google.com/document/d/1T-qK-_W4YAl9HNalzXgaGifgIiPuXrxhw4-pRU9F7Us/edit?usp=drivesdk
636	Jan-Mar 2024	https://docs.google.com/document/d/14cMI_09rU8Ti90HDZj-eM3aWK2R_yyOyc3zwShWgeWY/edit?usp=drivesdk
638	Jan-Mar 2024	https://docs.google.com/document/d/1YcYAFFmJLlMvr2wHAG6H6yRV4ayVk8KBnZbXSfeSzLY/edit?usp=drivesdk
639	Jan-Mar 2024	https://docs.google.com/document/d/12tikhr-TV3NvT7oSBOeG3DQP-Mmuv-PjXNp_B9o42uw/edit?usp=drivesdk
651	Jan-Mar 2024	https://docs.google.com/document/d/17OmrsKAnN-qz3BpG5D13lk_x5-5rf6cKtYtQdbuhyH4/edit?usp=drivesdk
654	Jan-Mar 2024	https://docs.google.com/document/d/1sPtFlq3j60ur99CdKKwUezF4FYMIxJIB1nIb2m-Ok4o/edit?usp=drivesdk
665	Jan-Mar 2024	https://docs.google.com/document/d/1W2Q05BFaehOlewDUBIFy68Kmg6YAfLPBdjNK2W51260/edit?usp=drivesdk
670	Jan-Mar 2024	https://docs.google.com/document/d/1O9aPNTAcDjvN37uYDbjwm3yWPxz217ufYp891HUalxE/edit?usp=drivesdk
673	Jan-Mar 2024	https://docs.google.com/document/d/1S7Xhx71ewfScsKIxi3i1yHaD3NFGNjxeReJn5v_s0Hw/edit?usp=drivesdk
675	Jan-Mar 2024	https://docs.google.com/document/d/1zLm-qOeQU7cyWVBR2No3MUNmr4ED-2tmZKnJL_3_GfE/edit?usp=drivesdk
676	Jan-Mar 2024	https://docs.google.com/document/d/1-wYgDB0_q4rEbUB0bvJs3b9l-djNcbKOCLUm6dxlLcM/edit?usp=drivesdk
679	Jan-Mar 2024	https://docs.google.com/document/d/1P7RLLXpHdnpJkWYfS4znFHhO4NHL-l4QEk2W9kH9W00/edit?usp=drivesdk
680	Jan-Mar 2024	https://docs.google.com/document/d/1VM1Puwcz-s9bKLqpbcWbtzny00-BHjJar-iW2aAuay0/edit?usp=drivesdk
683	Jan-Mar 2024	https://docs.google.com/document/d/1PrIUaZPEWGOrZzcQbZeNmHQDXWBYEFuqlAV-VYmlRNY/edit?usp=drivesdk
686	Jan-Mar 2024	https://docs.google.com/document/d/1R_h14DCvNdvdvNcxzVXhQBjYVgM6NYHOjwQTfHEn1IU/edit?usp=drivesdk
704	Jan-Mar 2024	https://docs.google.com/document/d/1iD0SYAdis2LJeWalvpNuAwS4bEzbifbc86CCx_fqVc8/edit?usp=drivesdk
707	Jan-Mar 2024	https://docs.google.com/document/d/1i2lyJyrXK-dq1pea0sGZ_uJ_HRttg-elmcrEQ1wOeHI/edit?usp=drivesdk
709	Jan-Mar 2024	https://docs.google.com/document/d/1uggQA1LlbdSRpa_0fasMTBoToT88vq2-DaGu5f4hZrI/edit?usp=drivesdk
716	Jan-Mar 2024	https://docs.google.com/document/d/1n52lIdOI5w79oOLOuDAHmzUzK6JebiCbFs8EEPWaElg/edit?usp=drivesdk
717	Jan-Mar 2024	https://docs.google.com/document/d/1a55lTUY9fmPmV6hrtsRVgQExpsRUCWWEpNufRgNmH18/edit?usp=drivesdk
719	Jan-Mar 2024	https://docs.google.com/document/d/1K_VP-hjIvipbIanTJcQLKY1N8zdsGjOENTXH8PGOKbU/edit?usp=drivesdk
726	Jan-Mar 2024	https://docs.google.com/document/d/1MJi7ToOFAL2h0OUNMUakVwZPilDXBDJ0Hr6TyMIL-hA/edit?usp=drivesdk
735	Jan-Mar 2024	https://docs.google.com/document/d/1BG9AJtf9coBaXTE5-Mdbp_ozBXR76PDXXEH8wK5OMpU/edit?usp=drivesdk
736	Jan-Mar 2024	https://docs.google.com/document/d/15ulY8W_3Kl5xTy7SD_N4VOtOKMwyVvjptbqAYdKdMbc/edit?usp=drivesdk
738	Jan-Mar 2024	https://docs.google.com/document/d/1fEzTlOSwmrAvmbZ50uuFrUeBHZupU_UCkPGZrHxN1EY/edit?usp=drivesdk
739	Jan-Mar 2024	https://docs.google.com/document/d/1wH_ufLFSn1aC2S6WoVZP4fF3GvHjpWf-Tvzu83RG070/edit?usp=drivesdk
740	Jan-Mar 2024	https://docs.google.com/document/d/1L1HT0AzFPDjzIoUm0d61maGmEINGskwh5zbMTvu6M0Q/edit?usp=drivesdk
741	Jan-Mar 2024	https://docs.google.com/document/d/1j3S9Q1GnA74YCdpg8AmLpalPVchChrjCEqgKelTIUb4/edit?usp=drivesdk
745	Jan-Mar 2024	https://docs.google.com/document/d/1TJxSScjmvJFb3WKD2YNiEyt-PyepUmSo88rAtIg4Jgw/edit?usp=drivesdk
751	Jan-Mar 2024	https://docs.google.com/document/d/1y8PD5Zxodl1kugMBwJ-ipZ_OI0POyYkcXK6KHFdHaeI/edit?usp=drivesdk
754	Jan-Mar 2024	https://docs.google.com/document/d/1qOelu14NFWe0SRsqMDBElNsrB3Kw0pc8H0Og-zsc2Wg/edit?usp=drivesdk
759	Jan-Mar 2024	https://docs.google.com/document/d/1a2BpzWlSrKZ__Dd4ec18MhtZotQGqImJajWrIp-6OIQ/edit?usp=drivesdk
761	Jan-Mar 2024	https://docs.google.com/document/d/1kJgWs3CpSLUCP3_zWMoXVLB6IeSKKF8D90ymkIskjfg/edit?usp=drivesdk
763	Jan-Mar 2024	https://docs.google.com/document/d/1m5sZfnRH9NHeRdpYnfpYxEYli46LjXXacZZc2JC3-yA/edit?usp=drivesdk
767	Jan-Mar 2024	https://docs.google.com/document/d/1jcgZ2RHMJt4MrOLDE7P77_iX1S4RssOP3DmsAVvtB9Q/edit?usp=drivesdk
768	Jan-Mar 2024	https://docs.google.com/document/d/1mh6DLsLLn7Vncmnf8qYwWQWEUCk3CmDxG2wt6ou1GPI/edit?usp=drivesdk
779	Jan-Mar 2024	https://docs.google.com/document/d/1bLadV6mi6cSBgASy6k-XQEDhuzc2XIznAdkT3aaUtuk/edit?usp=drivesdk
783	Jan-Mar 2024	https://docs.google.com/document/d/1crDv-b8QhJySjNQPcIgvoM0jHT1Ne1HQ-DafWrQ4lZ4/edit?usp=drivesdk
784	Jan-Mar 2024	https://docs.google.com/document/d/1kESeDSx0MmLnfhNtiF9cjWfOvVpx7Guv5oiL9c7ctZU/edit?usp=drivesdk
790	Jan-Mar 2024	https://docs.google.com/document/d/1LEq9_m9JvonB_TJsTpJFV1NQNYS3lkmrT-WZDh3dtlM/edit?usp=drivesdk
803	Jan-Mar 2024	https://docs.google.com/document/d/1QZQ8-k-qtMeycYpFoduY2q1_G8zir3yI1O8RVLK7kk8/edit?usp=drivesdk
45	Apr-Jun 2024	https://docs.google.com/document/d/1r0NsG51bZvX6m6oUMYsSGCBNc52JyWTcEEM3FPXl974/edit?usp=drivesdk
48	Apr-Jun 2024	https://docs.google.com/document/d/1ryUYWCEn2aGuZ5F-2cgKCWocisgpvMxOYGMh8X9Debs/edit?usp=drivesdk
49	Apr-Jun 2024	https://docs.google.com/document/d/1xS5oF_WxiAOaCDaEHlQUepZQyBin4fgC7ebdntj9QFI/edit?usp=drivesdk
60	Apr-Jun 2024	https://docs.google.com/document/d/1YznaT_rXN226rlYZSbpW2Xsd4t80Y59uAEhUuHt4AcA/edit?usp=drivesdk
125	Apr-Jun 2024	https://docs.google.com/document/d/1vLj0W0aPXRMROmh7Nkze9zi4g37u8CyCknqy3ohKrSo/edit?usp=drivesdk
141	Apr-Jun 2024	https://docs.google.com/document/d/1vk87Kd81Lmj3l2Bt1JU4l_Tx8FERcXqFWcPyTYPn84k/edit?usp=drivesdk
255	Apr-Jun 2024	https://docs.google.com/document/d/1vKsnyKbn7NYLwHoeGZq9NcuMxFSHfh6TYuT3KrIJZuQ/edit?usp=drivesdk
269	Apr-Jun 2024	https://docs.google.com/document/d/1oB1HS4u59MEJd5Mm-v7_C9vMZzJO7Qoe4_Xb-NpmCH4/edit?usp=drivesdk
274	Apr-Jun 2024	https://docs.google.com/document/d/1q7NeUsmYyy_nFpdSXjqFTY6T9uE_iJxohRFXDz8wzkE/edit?usp=drivesdk
285	Apr-Jun 2024	https://docs.google.com/document/d/1B2nyLZu1M2Xuv1PChBJJxysPkc9EA8CuQyBDgQK5kXM/edit?usp=drivesdk
301	Apr-Jun 2024	https://docs.google.com/document/d/1anK0QEB1poq-KHL6SXJzFNXxsEBDpuD5n32-HGqyND4/edit?usp=drivesdk
329	Apr-Jun 2024	https://docs.google.com/document/d/1Mdd7PNUv1d6VdW88K2T7Xg9GG8Xw7QDttcVt93-747E/edit?usp=drivesdk
333	Apr-Jun 2024	https://docs.google.com/document/d/1xdjlYfDCYc6TpL5jAIBr-nxCLJFefD6c59cshTsJaWc/edit?usp=drivesdk
368	Apr-Jun 2024	https://docs.google.com/document/d/1I34UwLuclkgrFylzMlw5U3AEia0MjwvfarkJgTtXtRU/edit?usp=drivesdk
375	Apr-Jun 2024	https://docs.google.com/document/d/1B_ukCrjHm3ggOOuhRa9FLo3QuSKTlRDOCmEtEZtXC8U/edit?usp=drivesdk
410	Apr-Jun 2024	https://docs.google.com/document/d/1BuZriGCP0KNsQOpYiMQQBkL197_xKYZcTqY0VdReuIQ/edit?usp=drivesdk
429	Apr-Jun 2024	https://docs.google.com/document/d/1gf1TSIgkX4a434xBYFoaorG8-fPK3ti2zSiy7I9OUNk/edit?usp=drivesdk
440	Apr-Jun 2024	https://docs.google.com/document/d/15xtcLnvuh5Ptk2_9iJ9cs5Xd7VQw2aAnQUyrN3el1ZQ/edit?usp=drivesdk
442	Apr-Jun 2024	https://docs.google.com/document/d/1vTzXiqwjG4NCFfg2D5TnOWrS0LQr1CYC1EgHLf-aM_s/edit?usp=drivesdk
443	Apr-Jun 2024	https://docs.google.com/document/d/1wRZfegmG3Fr60dwx5AiEbfaFJDo8T46ODgqVi7u_POU/edit?usp=drivesdk
482	Apr-Jun 2024	https://docs.google.com/document/d/1hRXPyGaDABhUcarhiGxVwk33drt6DkwO47bOvjixTMY/edit?usp=drivesdk
483	Apr-Jun 2024	https://docs.google.com/document/d/1JKVM5_UVkXoOyo9bAyCBqIfEMnvr7CmeX63OOovMMqY/edit?usp=drivesdk
528	Apr-Jun 2024	https://docs.google.com/document/d/1BdIpQoDQZ4O3pfj8_jf5gNJUcNJ-VODu9yJuxQFXK0Y/edit?usp=drivesdk
532	Apr-Jun 2024	https://docs.google.com/document/d/1QVQGTEbGmeQTfsHnTna4dfcLneTc4679RDITy-bHmYM/edit?usp=drivesdk
545	Apr-Jun 2024	https://docs.google.com/document/d/166224RuLNUWaTrfrvSWXakbSik76QIzVbfma5mEqgQg/edit?usp=drivesdk
548	Apr-Jun 2024	https://docs.google.com/document/d/1_Sgv9dg6vTld5Ubyf4TQE3sJ8O7I3ONWFHnWRAydg1U/edit?usp=drivesdk
553	Apr-Jun 2024	https://docs.google.com/document/d/1fwWdsGKJCWM9v8YoFHlqR7Xd2HhUZ1BQBJSDrW_QBkE/edit?usp=drivesdk
566	Apr-Jun 2024	https://docs.google.com/document/d/109GMCuOxJ8O5dGf13VeZ7oBYgyTGlkhnM5BD8rr_iyA/edit?usp=drivesdk
569	Apr-Jun 2024	https://docs.google.com/document/d/1EHpIgsj16d5iU-xQ7orPG2XUxARdDov3uekSY-BnAnw/edit?usp=drivesdk
574	Apr-Jun 2024	https://docs.google.com/document/d/1WrEWYNlvfpeWL2rbw3fQo5yuWxbB8qnJTAF1A0M0y44/edit?usp=drivesdk
575	Apr-Jun 2024	https://docs.google.com/document/d/1nVznS7gM0PMEe_NDguRnb6edOB1OHiolJjDB5NSI_a0/edit?usp=drivesdk
580	Apr-Jun 2024	https://docs.google.com/document/d/1vmPy-XKU9LBbhRnw-ygf4EuqXNsYDVQ1dyikdm46mk8/edit?usp=drivesdk
581	Apr-Jun 2024	https://docs.google.com/document/d/1Q45J40CtAmCE5W85WijKSqTAZ3qNQl47ne_mjMdiU8w/edit?usp=drivesdk
582	Apr-Jun 2024	https://docs.google.com/document/d/1t3QDL031mwTyXP_7APchwE104KRrGYb4N6dNHPfuXJc/edit?usp=drivesdk
585	Apr-Jun 2024	https://docs.google.com/document/d/19sRzH2YM8ZYeXEafewnYnItIgD1dnaDRm4uGlmIxP5s/edit?usp=drivesdk
586	Apr-Jun 2024	https://docs.google.com/document/d/1PAkQgW8zV-1r-uFDrb1SPVufTBF0D8Cafsn_66o5SVc/edit?usp=drivesdk
587	Apr-Jun 2024	https://docs.google.com/document/d/1uiuQsVtV4jDL0ZlDtRkzJTFktIVgBHOq4nWcoMWiax4/edit?usp=drivesdk
601	Apr-Jun 2024	https://docs.google.com/document/d/1kJoOzZyf_hs_PuRczplpFBvVrHVnIOiCfma2-tWp48A/edit?usp=drivesdk
604	Apr-Jun 2024	https://docs.google.com/document/d/1peMKBNE3m_Pv0HuL3T9SDuVFYeLUB0PONa6iRIabuXU/edit?usp=drivesdk
613	Apr-Jun 2024	https://docs.google.com/document/d/1zFwcTVqjgIrVQcWwOV-IEWHRDsyJe0mW7CEPFPHmrXk/edit?usp=drivesdk
614	Apr-Jun 2024	https://docs.google.com/document/d/1yV7TkIceVaVuWWKBOa96A_-8jmiCqAuPEA9YpmnfcM8/edit?usp=drivesdk
625	Apr-Jun 2024	https://docs.google.com/document/d/1dPo8v2v8vrvghvPu2PTrQ34-qrkBFaLJyQV2K4XwwHg/edit?usp=drivesdk
629	Apr-Jun 2024	https://docs.google.com/document/d/19PPbHrza0Hm7LT3nEqYgUFXCSsSdrfdIeZNxOYEa3vQ/edit?usp=drivesdk
631	Apr-Jun 2024	https://docs.google.com/document/d/1xrSZk11O7Cx-TY-8FbpznUwLauavMlsN2dbB3MfhrNc/edit?usp=drivesdk
633	Apr-Jun 2024	https://docs.google.com/document/d/1FjQikVlu9eQyH9CVvujLva7hCe0U7mEmd-NyPV-E8OY/edit?usp=drivesdk
636	Apr-Jun 2024	https://docs.google.com/document/d/1SiPdtF1X859UJsCnq0mUXPvzPnpHca-SZhM0CZj0Au8/edit?usp=drivesdk
638	Apr-Jun 2024	https://docs.google.com/document/d/1ex3sTYJiBmQeRbG2biSSJwtBGI0v0iQFpbTE6oKUDc4/edit?usp=drivesdk
639	Apr-Jun 2024	https://docs.google.com/document/d/1R40296bbsb31_GNzNnvGvDfE_p70xOExTRm8NHLTKDY/edit?usp=drivesdk
651	Apr-Jun 2024	https://docs.google.com/document/d/1HofPl34wxW3Cz57siXvg4PjDHYBfsfjVUIjDjA1jCJ8/edit?usp=drivesdk
654	Apr-Jun 2024	https://docs.google.com/document/d/11hIxgDqXrPPt3cnlcYUKjcc3urQqGa98ANNMNW8KxVc/edit?usp=drivesdk
665	Apr-Jun 2024	https://docs.google.com/document/d/1wwhSHBHtyAiDt6yc804nPBVHLXP7cA1zrDr45FUq1VI/edit?usp=drivesdk
670	Apr-Jun 2024	https://docs.google.com/document/d/1pTrC-3PFflk9r-HDqQfrtlNywOKJjyq54Hwj5Qy3LFs/edit?usp=drivesdk
673	Apr-Jun 2024	https://docs.google.com/document/d/1AaDViVb4Dm-9K28GA9nSGW1_zHCsqMg36nKpK1TTZTQ/edit?usp=drivesdk
675	Apr-Jun 2024	https://docs.google.com/document/d/1Z0r-kcxnCPJLVAldxSywKVEnASphFPNMDP1KoFf74C0/edit?usp=drivesdk
676	Apr-Jun 2024	https://docs.google.com/document/d/1lAmO3FNhbxnkXuZNyDHm6Ov19XAHe4AUBHMPEDsCARw/edit?usp=drivesdk
679	Apr-Jun 2024	https://docs.google.com/document/d/15Tz-wdur0Pucy1xvS3QbY_NpmsmSzK1WJwS-e6EYNAM/edit?usp=drivesdk
680	Apr-Jun 2024	https://docs.google.com/document/d/1kBxCEGPgrJdefe7_uaqpUkMQOE2OMahXo_wAI8xyngQ/edit?usp=drivesdk
683	Apr-Jun 2024	https://docs.google.com/document/d/1Kt82DeX4rKNjJsruQBdXboGCJ3ZYSAnHyfcsiq_YWro/edit?usp=drivesdk
686	Apr-Jun 2024	https://docs.google.com/document/d/1NmDWt6X0-Pr7VDs9_NOsYEKaHtm1K08bz3zrseHY23M/edit?usp=drivesdk
704	Apr-Jun 2024	https://docs.google.com/document/d/13sXopSfBx91sbUnwf4xpUHyDv9ccFGd-wVDGf6Dr1RA/edit?usp=drivesdk
707	Apr-Jun 2024	https://docs.google.com/document/d/1prQcEF9Fsf7y1qb0jDiZfSSzCU0nUxXrAEgL4nRk7qc/edit?usp=drivesdk
709	Apr-Jun 2024	https://docs.google.com/document/d/1whn5TT3YBpymyAid9vhM7nrOmi-esBB2Yzb1AVc5s8M/edit?usp=drivesdk
716	Apr-Jun 2024	https://docs.google.com/document/d/1BoqFodgRyXu6rRlDsQKiHZxNcO3hx1tLaVPzW411nU4/edit?usp=drivesdk
719	Apr-Jun 2024	https://docs.google.com/document/d/1QTSM8Xfmz99EIPosQ4Wt2aGpnZckuM4rbQhYmvSggRQ/edit?usp=drivesdk
726	Apr-Jun 2024	https://docs.google.com/document/d/1xxtAKev3_LMic-5_r4PQb2kP77UEN5BBMhestjj80pA/edit?usp=drivesdk
735	Apr-Jun 2024	https://docs.google.com/document/d/13yDy5uBOvh0jxW5Vt92fc4Din6h4R9htxGYWeBRSsaM/edit?usp=drivesdk
736	Apr-Jun 2024	https://docs.google.com/document/d/1oUQ1h3XeTBhyeMGKLLiY7_DdZDkObk0R5HMQIUvA3ro/edit?usp=drivesdk
738	Apr-Jun 2024	https://docs.google.com/document/d/1crYYel7AS7mvxp72mzR0HSPO26gmzlJEuBZW2fY1riM/edit?usp=drivesdk
739	Apr-Jun 2024	https://docs.google.com/document/d/1pHr1sdHoz_rRbXMzzQTGgX8-QkKLrSWNc9blPRFlVIQ/edit?usp=drivesdk
740	Apr-Jun 2024	https://docs.google.com/document/d/1zxbY_woOdnolDVCdDprCpip_SaW0p9FEwF-xiBjTRdc/edit?usp=drivesdk
741	Apr-Jun 2024	https://docs.google.com/document/d/16vx1loTOMyjjscxR1FGYgWvfoesxgpwzX1Mg6m4N4so/edit?usp=drivesdk
745	Apr-Jun 2024	https://docs.google.com/document/d/1dOdlvIKwW3DrD70nPaRm6xnbbs3RiYTZbkF5MGypajY/edit?usp=drivesdk
751	Apr-Jun 2024	https://docs.google.com/document/d/1AWAK8ZPcqQa-KweXm9Iv3aXumOLYKiQ3P1sqefLTGUo/edit?usp=drivesdk
754	Apr-Jun 2024	https://docs.google.com/document/d/17VcFaCzd7ERYUTRkrr_DtWypIVIy1YlamMpJuFH9fdg/edit?usp=drivesdk
759	Apr-Jun 2024	https://docs.google.com/document/d/1e715lAIUUGVCmLDWyGL3bxV_mkF5CokaCkk0nzg9-4E/edit?usp=drivesdk
761	Apr-Jun 2024	https://docs.google.com/document/d/1ShgcNA90elKzgsqZrzzrzRpy2508d-6dDB1sYYYD1KE/edit?usp=drivesdk
763	Apr-Jun 2024	https://docs.google.com/document/d/1E0GB0oCe_ylj9Ucmcqc0nTt2ybKpB0qLiQ1C_ZbUqOk/edit?usp=drivesdk
767	Apr-Jun 2024	https://docs.google.com/document/d/1SBmZlbPU2CP3L8KTeogMsou6e-ZNG0JMpvzNKBhrinA/edit?usp=drivesdk
768	Apr-Jun 2024	https://docs.google.com/document/d/1fN2ASsBpVZaB86O79XdtoiGnvOGI56eVNE4SwkM9iko/edit?usp=drivesdk
779	Apr-Jun 2024	https://docs.google.com/document/d/1En6ceRyi-Y866WOASZRhQIXTufOHHRS8-Avex52wG7U/edit?usp=drivesdk
783	Apr-Jun 2024	https://docs.google.com/document/d/13Ql3iP3hZHEuPRn1ZNclOr_v2lvtZ7Vj3l3bMANcMw8/edit?usp=drivesdk
784	Apr-Jun 2024	https://docs.google.com/document/d/1cehrPbjR9c1mKWpgkYnR4BxKZpD2mmVvdpMMDh5sjbs/edit?usp=drivesdk
785	Apr-Jun 2024	https://docs.google.com/document/d/1OMItrLmoIWqE4XPOdY-8u2mCIwp5yWSj04lvU4R-TC8/edit?usp=drivesdk
790	Apr-Jun 2024	https://docs.google.com/document/d/1gnLQzpLm59358_OQs_UqkNm4ylOmw6BWlWaGeQ_OSOQ/edit?usp=drivesdk
801	Apr-Jun 2024	https://docs.google.com/document/d/1bDNGbXJ0SLu65_jN0jerw8Yj7OHGnRkJmsb_cHIN2fU/edit?usp=drivesdk
803	Apr-Jun 2024	https://docs.google.com/document/d/1Q11oZkZLcDJ_zpT5U-V27Ul-7j5XaLjwdzzAJQg_DhI/edit?usp=drivesdk
806	Apr-Jun 2024	https://docs.google.com/document/d/1yYHtrP0poBvCT9-WcRYop_no5Aew6rM48sd5EjEYfGY/edit?usp=drivesdk
809	Apr-Jun 2024	https://docs.google.com/document/d/1sIPSXC9AMD09vHEflzd21VCOhIGAvk3ISXErlRB_Ids/edit?usp=drivesdk
811	Apr-Jun 2024	https://docs.google.com/document/d/17DTSFsB8uMiDNKo6d4TMSs7fLbQshw2iA0svyqs0EPU/edit?usp=drivesdk
819	Apr-Jun 2024	https://docs.google.com/document/d/1148loYMtA4LW8D5UnxHNlbTjMi5qMUXbeancH2U9K2g/edit?usp=drivesdk
822	Apr-Jun 2024	https://docs.google.com/document/d/1tKCj8qxCQydIw4r_zgN0M9cdD9vNTJrtXU_2yoiacPk/edit?usp=drivesdk
45	Jul-Sept 2024	https://docs.google.com/document/d/1zhgJivYacbhIIpnU4IV57tIOtGdg8ioTlAMY-PUfPi0/edit?usp=drivesdk
48	Jul-Sept 2024	https://docs.google.com/document/d/1djrbW3052FyHkDR3IraKV4H11GvMtVfPjHjCg5iTzeY/edit?usp=drivesdk
49	Jul-Sept 2024	https://docs.google.com/document/d/1iM9hwmz2tXXz6CQxO4vqBNN42ODbDTUFITPOnXq-sv0/edit?usp=drivesdk
50	Jul-Sept 2024	https://docs.google.com/document/d/1W6yEYI6N6GDcjjYSNTtMGCBKVXPGSMmz9G9iQtT4OQg/edit?usp=drivesdk
60	Jul-Sept 2024	https://docs.google.com/document/d/1M2nBKRaSf9kbISaa0J5_tahf8u2jdDPIspfYd7r8uNc/edit?usp=drivesdk
125	Jul-Sept 2024	https://docs.google.com/document/d/1qZPi5AM-zgrPR_p9-u_uJ9fzZsft_tsOlaltswArIx8/edit?usp=drivesdk
136	Jul-Sept 2024	https://docs.google.com/document/d/1j8tD-x_w3gBOSms3OvgsOQ0u4Ld2jtQJX-FB20JSgSQ/edit?usp=drivesdk
141	Jul-Sept 2024	https://docs.google.com/document/d/18M2UDL9dXO2ItRQ1h_Vs0r96kMgIVhUjld89Ty1kyiU/edit?usp=drivesdk
255	Jul-Sept 2024	https://docs.google.com/document/d/1Kz1s7Cngiv85cIdbXNYEEUf2Ne74YxjXt9EeqZrLuYo/edit?usp=drivesdk
269	Jul-Sept 2024	https://docs.google.com/document/d/10Gf_DsrfSK4tO7mLC5h03BtnUa3SfhA33b5rAD1ofsA/edit?usp=drivesdk
274	Jul-Sept 2024	https://docs.google.com/document/d/15k5zuPGhwHYVQlSCoQeBY9AK1b0D6iXlPKGgRy2LYoA/edit?usp=drivesdk
285	Jul-Sept 2024	https://docs.google.com/document/d/1t-_IlDikXTFOtD0O1uVkQSbnfZt635-3jW_ZkxQtAkk/edit?usp=drivesdk
301	Jul-Sept 2024	https://docs.google.com/document/d/1H5roqZ_bkMC020RGJQXQeCGxVe2GVE1rsp8FdJTrRo8/edit?usp=drivesdk
329	Jul-Sept 2024	https://docs.google.com/document/d/1PO_DUsdqUZ0rMDLJPSoeGJZZB59RfuXhYPKhFS3tT9E/edit?usp=drivesdk
333	Jul-Sept 2024	https://docs.google.com/document/d/1vRxhMws8sq1yQVtFhu60YMsoRacSQs_vgx1k5JxTwQE/edit?usp=drivesdk
368	Jul-Sept 2024	https://docs.google.com/document/d/1em3bnkJKGw0dnWSL-qjkeBcXKcg5G2UiEaoVSSxQTWg/edit?usp=drivesdk
375	Jul-Sept 2024	https://docs.google.com/document/d/1ZX-k5t-FAxUc-p4fLeSFtL99NikjsySNnCD90BsmXGk/edit?usp=drivesdk
410	Jul-Sept 2024	https://docs.google.com/document/d/1jfyYa9WeCnpkydnYuJNigSZ55okALSPO0we-wKfO3MY/edit?usp=drivesdk
429	Jul-Sept 2024	https://docs.google.com/document/d/19eZkgZ1xHKhE2BYD75Kkfw-Uv7v2_dPq3TS0MqjgE9c/edit?usp=drivesdk
440	Jul-Sept 2024	https://docs.google.com/document/d/1IT8w_vEasNaihw4yNdMlCzwKC8ZeNfLBd-yRY4RmI9c/edit?usp=drivesdk
442	Jul-Sept 2024	https://docs.google.com/document/d/1Mn2nWuhNGRzt2ztalCZspyF-GUXe_2HwA_v88hKWa9c/edit?usp=drivesdk
443	Jul-Sept 2024	https://docs.google.com/document/d/1wPGnrqx7248ayABVKpbOjzN_t0wdf1r8UpNnODRFRIE/edit?usp=drivesdk
482	Jul-Sept 2024	https://docs.google.com/document/d/1thTAm20GsIgxoO6xz-FswFVKT6haJs9srx8pyeMnptk/edit?usp=drivesdk
483	Jul-Sept 2024	https://docs.google.com/document/d/1N8OU7mtSTCjQS1Xs9PnacEMLrwHgu-ssCNEN3PIyH_Q/edit?usp=drivesdk
490	Jul-Sept 2024	https://docs.google.com/document/d/1Ry6tLD4g6VkJ7bYlDeG9FZM27QnzGS2uPUgL14BU09M/edit?usp=drivesdk
528	Jul-Sept 2024	https://docs.google.com/document/d/1YsHtUqi8_QMRSLSdiFAScbdqlCpVfPflbdasOaah0_A/edit?usp=drivesdk
532	Jul-Sept 2024	https://docs.google.com/document/d/1j6HDBd3JL6BKwL1F1dpq8RHiei47qDPuaxUcwxfFx9Y/edit?usp=drivesdk
545	Jul-Sept 2024	https://docs.google.com/document/d/1A6GeZn91qJpmkYTsGDgxUBzWiLCJeW0ph6LoX1TWbgg/edit?usp=drivesdk
548	Jul-Sept 2024	https://docs.google.com/document/d/1B0sv0SaWH5vLNLX-G3JsqfrfdDbyD-Sd6bxqObuk5wc/edit?usp=drivesdk
553	Jul-Sept 2024	https://docs.google.com/document/d/1nU5rm4kSMifwZmkH67mHLThT2c1jF37A2AQfTXdaX9I/edit?usp=drivesdk
566	Jul-Sept 2024	https://docs.google.com/document/d/1CzVGrtvkXOH5Iw6UuW1pksHdEYUIZG41stn3mcBP5vc/edit?usp=drivesdk
569	Jul-Sept 2024	https://docs.google.com/document/d/1q-ssX5mqItw9QOSBO-LOhHoNwsfU-9RMFN_paV_hPI4/edit?usp=drivesdk
574	Jul-Sept 2024	https://docs.google.com/document/d/1KK6k0D1GiJ0qLT08BX_CBzOvUSSEH1GNSq2Nizyjisc/edit?usp=drivesdk
575	Jul-Sept 2024	https://docs.google.com/document/d/1Btg__IOcia6wgbZa02YEqr_o-SZDY-VpNcOb_wz6apY/edit?usp=drivesdk
580	Jul-Sept 2024	https://docs.google.com/document/d/1UlcAc4MTzZGO5prwnsPUspkKYJpg6Po8z7VkprzXW1s/edit?usp=drivesdk
581	Jul-Sept 2024	https://docs.google.com/document/d/1bQoy3nbvWFBrmplJgxLtJriIG-Tf8jByszmz4OAgbnA/edit?usp=drivesdk
582	Jul-Sept 2024	https://docs.google.com/document/d/1H-gzPPrOlnIiIyoEoH1hE3YS7gH3nVYrWJdxL2wvlrA/edit?usp=drivesdk
585	Jul-Sept 2024	https://docs.google.com/document/d/1jO6UndRkl9VIn6XupE6zC0U6V6ZvHSYWXBG9tHs
`;

async function main() {
  try {
    // 1. Ensure table is created (just in case this script runs before restarting server)
    console.log('Ensure quarterly_report table exists...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS quarterly_report (
        id SERIAL PRIMARY KEY,
        trainee_id VARCHAR(50) NOT NULL REFERENCES dashboard_trainne(id) ON DELETE CASCADE,
        periode VARCHAR(100) NOT NULL,
        url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(trainee_id, periode)
      );
    `);

    // 2. Parse rawData
    const lines = rawData.trim().split('\n');
    const records = [];
    const dedupSet = new Set();

    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length < 3) continue;
      const id = parts[0].trim();
      const periode = parts[1].trim();
      const url = parts[2].trim();

      if (!id || isNaN(id) || !periode || !url) continue;

      const dedupKey = `${id}|||${periode}`;
      if (dedupSet.has(dedupKey)) {
        continue;
      }
      dedupSet.add(dedupKey);

      records.push({ id, periode, url });
    }

    console.log(`Parsed ${records.length} unique quarterly report records to seed.`);

    let insertedCount = 0;
    let updatedCount = 0;
    let missingIds = new Set();

    // 3. Upsert records into quarterly_report
    for (const rec of records) {
      let targetId = rec.id;
      // Map Lady Valery Sinambela ID 968 -> 966
      if (targetId === '968') {
        targetId = '966';
      }

      // Check if trainee exists in DB
      const check = await db.query('SELECT 1 FROM dashboard_trainne WHERE id = $1', [targetId]);
      if (check.rows.length === 0) {
        missingIds.add(rec.id);
        continue;
      }

      // Perform upsert (INSERT ... ON CONFLICT DO UPDATE)
      await db.query(`
        INSERT INTO quarterly_report (trainee_id, periode, url)
        VALUES ($1, $2, $3)
        ON CONFLICT (trainee_id, periode)
        DO UPDATE SET url = EXCLUDED.url;
      `, [targetId, rec.periode, rec.url]);
      insertedCount++;
    }

    console.log(`\n=======================================`);
    console.log(`         SEEDING COMPLETED             `);
    console.log(`=======================================`);
    console.log(`Successfully Upserted: ${insertedCount} records.`);
    console.log(`Missing Trainees:      ${missingIds.size}`);
    if (missingIds.size > 0) {
      console.log('Missing Trainee IDs:', Array.from(missingIds));
    }
    console.log(`=======================================\n`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

main();

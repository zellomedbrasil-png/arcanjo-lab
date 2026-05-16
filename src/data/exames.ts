// Auto-generated from exames_ipm_issec.md
export interface Exame {
  nome: string;
  marca: string;
  codIssec: string;
  codIpm: string;
}

export interface CategoriaExames {
  nome: string;
  exames: Exame[];
}

export const CATEGORIAS_EXAMES: CategoriaExames[] = [
  {
    "nome": "HEMATOLOGIA E COAGULAÇÃO",
    "exames": [
      {
        "nome": "ANTI TROMBINA III",
        "marca": "**",
        "codIssec": "",
        "codIpm": "40304060"
      },
      {
        "nome": "CARBOXIHEMOGLOBINA",
        "marca": "",
        "codIssec": "28150090",
        "codIpm": "40313093"
      },
      {
        "nome": "COAGULOGRAMA",
        "marca": "",
        "codIssec": "28040139",
        "codIpm": "40304922"
      },
      {
        "nome": "COOMBS DIRETO",
        "marca": "",
        "codIssec": "28040155",
        "codIpm": "40304108"
      },
      {
        "nome": "COOMBS INDIRETO",
        "marca": "",
        "codIssec": "28040988",
        "codIpm": "40304884"
      },
      {
        "nome": "ELETROFORESE DE HEMOGLOBINA",
        "marca": "",
        "codIssec": "28040430",
        "codIpm": "40304353"
      },
      {
        "nome": "FIBRINOGENIO",
        "marca": "",
        "codIssec": "28040333",
        "codIpm": "40304264"
      },
      {
        "nome": "HEMATOCRITO",
        "marca": "",
        "codIssec": "28040414",
        "codIpm": "40304337"
      },
      {
        "nome": "HEMOGLOBINA",
        "marca": "",
        "codIssec": "28040422",
        "codIpm": "40304345"
      },
      {
        "nome": "HEMOGLOBINA GLICADA - HBA1C",
        "marca": "",
        "codIssec": "28011023",
        "codIpm": "40302075"
      },
      {
        "nome": "HEMOGRAMA COMPLETO",
        "marca": "",
        "codIssec": "28040481",
        "codIpm": "40304361"
      },
      {
        "nome": "RETICULOCITOS - CONTAGEM",
        "marca": "",
        "codIssec": "28040660",
        "codIpm": "40304558"
      },
      {
        "nome": "TEMPO DE PROTROMBINA - TAP",
        "marca": "",
        "codIssec": "28040732",
        "codIpm": "40304590"
      },
      {
        "nome": "TEMPO DE TROMBOPLASTINA PARCIAL ATIVADO - TTPA",
        "marca": "",
        "codIssec": "28040791",
        "codIpm": "40304639"
      },
      {
        "nome": "VHS - HEMOSSEDIMENTACAO",
        "marca": "",
        "codIssec": "28040490",
        "codIpm": "40304370"
      }
    ]
  },
  {
    "nome": "GLICEMIA E METABOLISMO GLICÍDICO",
    "exames": [
      {
        "nome": "CURVA DE GLICOSE E INSULINA",
        "marca": "**",
        "codIssec": "",
        "codIpm": "40305228"
      },
      {
        "nome": "CURVA GLICEMICA",
        "marca": "",
        "codIssec": "28010604",
        "codIpm": "40301680"
      },
      {
        "nome": "FRUTOSAMINA",
        "marca": "",
        "codIssec": "28011554",
        "codIpm": "40301958"
      },
      {
        "nome": "GLICOSE",
        "marca": "",
        "codIssec": "28010973",
        "codIpm": "40302040"
      },
      {
        "nome": "INSULINA",
        "marca": "",
        "codIssec": "28050355",
        "codIpm": "40316360"
      },
      {
        "nome": "PEPTIDEO C",
        "marca": "",
        "codIssec": "28011686",
        "codIpm": "40316394"
      }
    ]
  },
  {
    "nome": "PERFIL LIPÍDICO",
    "exames": [
      {
        "nome": "APOLIPOPROTEINA A",
        "marca": "",
        "codIssec": "28011678",
        "codIpm": "40301354"
      },
      {
        "nome": "APOLIPOPROTEINA B",
        "marca": "",
        "codIssec": "28011678",
        "codIpm": "40301362"
      },
      {
        "nome": "APOLIPOPROTEINAS A1 E B (PAINEL COMBINADO)",
        "marca": "*",
        "codIssec": "28011678",
        "codIpm": ""
      },
      {
        "nome": "COLESTEROL HDL",
        "marca": "",
        "codIssec": "28010493",
        "codIpm": "40301583"
      },
      {
        "nome": "COLESTEROL LDL",
        "marca": "",
        "codIssec": "28011511",
        "codIpm": "40301591"
      },
      {
        "nome": "COLESTEROL TOTAL",
        "marca": "",
        "codIssec": "28010507",
        "codIpm": "40301605"
      },
      {
        "nome": "COLESTEROL VLDL",
        "marca": "",
        "codIssec": "28011520",
        "codIpm": "40302695"
      },
      {
        "nome": "LIPASE",
        "marca": "",
        "codIssec": "28011082",
        "codIpm": "40302199"
      },
      {
        "nome": "LIPIDOGRAMA",
        "marca": "",
        "codIssec": "28011104",
        "codIpm": "40302750"
      },
      {
        "nome": "TRIGLICERIDEOS",
        "marca": "",
        "codIssec": "28011392",
        "codIpm": "40302547"
      }
    ]
  },
  {
    "nome": "FUNÇÃO RENAL E URINA",
    "exames": [
      {
        "nome": "ACIDO URICO",
        "marca": "",
        "codIssec": "28010175",
        "codIpm": "40301150"
      },
      {
        "nome": "CLEARANCE DE CREATININA",
        "marca": "",
        "codIssec": "28010426",
        "codIpm": "40301508"
      },
      {
        "nome": "CREATININA",
        "marca": "",
        "codIssec": "28010540",
        "codIpm": "40301630"
      },
      {
        "nome": "MICROALBUMINURIA 24H",
        "marca": "",
        "codIssec": "28130456",
        "codIpm": "40311171"
      },
      {
        "nome": "PROTEINURIA 24H",
        "marca": "",
        "codIssec": "28130316",
        "codIpm": "40311180"
      },
      {
        "nome": "RELACAO PROTEINA/CREATININA URINARIA",
        "marca": "",
        "codIssec": "28130316",
        "codIpm": "40311180"
      },
      {
        "nome": "SUMARIO DE URINA",
        "marca": "",
        "codIssec": "28130367",
        "codIpm": "40311210"
      },
      {
        "nome": "UREIA",
        "marca": "",
        "codIssec": "28011414",
        "codIpm": "40302580"
      },
      {
        "nome": "URINOCULTURA",
        "marca": "",
        "codIssec": "28100549",
        "codIpm": "40310213"
      }
    ]
  },
  {
    "nome": "FUNÇÃO HEPÁTICA E PANCREÁTICA",
    "exames": [
      {
        "nome": "ALBUMINA",
        "marca": "",
        "codIssec": "28011600",
        "codIpm": "40301222"
      },
      {
        "nome": "AMILASE",
        "marca": "",
        "codIssec": "28010256",
        "codIpm": "40301281"
      },
      {
        "nome": "BILIRRUBINAS",
        "marca": "",
        "codIssec": "28010299",
        "codIpm": "40301397"
      },
      {
        "nome": "FOSFATASE ALCALINA",
        "marca": "",
        "codIssec": "28010850",
        "codIpm": "40301885"
      },
      {
        "nome": "GAMA GLUTAMIL TRANSFERASE - GGT",
        "marca": "",
        "codIssec": "28010957",
        "codIpm": "40301990"
      },
      {
        "nome": "HEPATOGRAMA (PAINEL CONJUNTO)",
        "marca": "**",
        "codIssec": "",
        "codIpm": "40312151"
      },
      {
        "nome": "PROTEINAS TOTAIS E FRACOES",
        "marca": "",
        "codIssec": "28011244",
        "codIpm": "40302385"
      },
      {
        "nome": "TGO - TRANSAMINASE ASPARTICA",
        "marca": "",
        "codIssec": "28011368",
        "codIpm": "40302504"
      },
      {
        "nome": "TGP - TRANSAMINASE ALANINA",
        "marca": "",
        "codIssec": "28011376",
        "codIpm": "40302512"
      }
    ]
  },
  {
    "nome": "TIREOIDE",
    "exames": [
      {
        "nome": "ANTI TIREOGLOBULINA",
        "marca": "",
        "codIssec": "28060156",
        "codIpm": "40316106"
      },
      {
        "nome": "ANTI-MICROSSOMAL - ANTI TPO",
        "marca": "",
        "codIssec": "28060164",
        "codIpm": "40306348"
      },
      {
        "nome": "CALCITONINA",
        "marca": "",
        "codIssec": "28050070",
        "codIpm": "40316165"
      },
      {
        "nome": "T3 LIVRE",
        "marca": "",
        "codIssec": "28050827",
        "codIpm": "40316467"
      },
      {
        "nome": "T3 REVERSO",
        "marca": "",
        "codIssec": "28050789",
        "codIpm": "40316483"
      },
      {
        "nome": "T3 TOTAL - TRIIODOTIRONINA",
        "marca": "",
        "codIssec": "28050738",
        "codIpm": "40316556"
      },
      {
        "nome": "T4 LIVRE - TIROXINA LIVRE",
        "marca": "",
        "codIssec": "28050720",
        "codIpm": "40316491"
      },
      {
        "nome": "T4 TOTAL - TIROXINA",
        "marca": "",
        "codIssec": "28050711",
        "codIpm": "40316548"
      },
      {
        "nome": "TIREOGLOBULINA",
        "marca": "",
        "codIssec": "28050800",
        "codIpm": "40316530"
      },
      {
        "nome": "TRAB - ANTI RECEPTOR TSH",
        "marca": "",
        "codIssec": "",
        "codIpm": "40316084"
      },
      {
        "nome": "TSH",
        "marca": "",
        "codIssec": "28050703",
        "codIpm": "40316521"
      }
    ]
  },
  {
    "nome": "HORMÔNIOS E ENDOCRINOLOGIA",
    "exames": [
      {
        "nome": "17 ALFA-HIDROXIPROGESTERONA",
        "marca": "",
        "codIssec": "28050428",
        "codIpm": "40316017"
      },
      {
        "nome": "17 CETOGENICOS",
        "marca": "",
        "codIssec": "28050096",
        "codIpm": "40305040"
      },
      {
        "nome": "17 KS - CETOSTEROIDES",
        "marca": "",
        "codIssec": "28050126",
        "codIpm": "40305082"
      },
      {
        "nome": "ACTH - ADRENOCORTICOTROFICO",
        "marca": "",
        "codIssec": "28050029",
        "codIpm": "40316041"
      },
      {
        "nome": "ALDOSTERONA",
        "marca": "",
        "codIssec": "28050037",
        "codIpm": "40316050"
      },
      {
        "nome": "ANDROSTENEDIONA",
        "marca": "",
        "codIssec": "28050061",
        "codIpm": "40316076"
      },
      {
        "nome": "BIG PROLACTINA",
        "marca": "",
        "codIssec": "28050347",
        "codIpm": "40305775"
      },
      {
        "nome": "CORTISOL",
        "marca": "",
        "codIssec": "28050142",
        "codIpm": "40316190"
      },
      {
        "nome": "CORTISOL URINARIO 24H",
        "marca": "",
        "codIssec": "28050819",
        "codIpm": "40305210"
      },
      {
        "nome": "DHEA - DEHIDROEPIANDROSTERONA",
        "marca": "",
        "codIssec": "28050215",
        "codIpm": "40316211"
      },
      {
        "nome": "DHT - DIHIDROTESTOSTERONA",
        "marca": "",
        "codIssec": "28050231",
        "codIpm": "40316220"
      },
      {
        "nome": "ESTRADIOL E2",
        "marca": "",
        "codIssec": "28050240",
        "codIpm": "40316246"
      },
      {
        "nome": "ESTRIOL E3",
        "marca": "",
        "codIssec": "28050258",
        "codIpm": "40316254"
      },
      {
        "nome": "ESTRONA E1",
        "marca": "",
        "codIssec": "28050304",
        "codIpm": "40316262"
      },
      {
        "nome": "FSH - H. FOLICULO ESTIMULANTE",
        "marca": "",
        "codIssec": "28050312",
        "codIpm": "40316289"
      },
      {
        "nome": "HORMONIO DO CRESCIMENTO - GH",
        "marca": "",
        "codIssec": "28050169",
        "codIpm": "40316203"
      },
      {
        "nome": "IGFBP-3",
        "marca": "",
        "codIssec": "28050967",
        "codIpm": "40305406"
      },
      {
        "nome": "LH - HORMONIO LUTEINIZANTE",
        "marca": "",
        "codIssec": "28050380",
        "codIpm": "40316335"
      },
      {
        "nome": "PARATORMONIO - PTH",
        "marca": "",
        "codIssec": "28050754",
        "codIpm": "40316424"
      },
      {
        "nome": "PROGESTERONA",
        "marca": "",
        "codIssec": "28050410",
        "codIpm": "40316408"
      },
      {
        "nome": "PROLACTINA",
        "marca": "",
        "codIssec": "28050436",
        "codIpm": "40316416"
      },
      {
        "nome": "RENINA",
        "marca": "",
        "codIssec": "28050509",
        "codIpm": "40316432"
      },
      {
        "nome": "S-DHEA (DHEA-S)",
        "marca": "",
        "codIssec": "28050223",
        "codIpm": "40316459"
      },
      {
        "nome": "SHBG - GLOBULINA LIGADORA DE HORMONIOS SEXUAIS",
        "marca": "",
        "codIssec": "",
        "codIpm": "40316300"
      },
      {
        "nome": "SOMATOMEDINA C - IGF-1",
        "marca": "",
        "codIssec": "28050797",
        "codIpm": "40316440"
      },
      {
        "nome": "TESTOSTERONA LIVRE",
        "marca": "",
        "codIssec": "28050770",
        "codIpm": "40316505"
      },
      {
        "nome": "TESTOSTERONA TOTAL",
        "marca": "",
        "codIssec": "28050690",
        "codIpm": "40316513"
      }
    ]
  },
  {
    "nome": "MINERAIS, VITAMINAS E OLIGOELEMENTOS",
    "exames": [
      {
        "nome": "25-HIDROXIVITAMINA D (VIT D25)",
        "marca": "**",
        "codIssec": "",
        "codIpm": "40302830"
      },
      {
        "nome": "ACIDO FOLICO",
        "marca": "",
        "codIssec": "28010060",
        "codIpm": "40301087"
      },
      {
        "nome": "ALUMINIO",
        "marca": "",
        "codIssec": "28011490",
        "codIpm": "40301273"
      },
      {
        "nome": "CALCIO",
        "marca": "",
        "codIssec": "28010329",
        "codIpm": "40301400"
      },
      {
        "nome": "CALCIO IONICO",
        "marca": "",
        "codIssec": "28010337",
        "codIpm": "40301419"
      },
      {
        "nome": "CAPACIDADE DE LIGACAO DO FERRO",
        "marca": "*",
        "codIssec": "28010345",
        "codIpm": ""
      },
      {
        "nome": "CHUMBO SERICO",
        "marca": "",
        "codIssec": "28150120",
        "codIpm": "40313107"
      },
      {
        "nome": "COBRE SERICO",
        "marca": "",
        "codIssec": "28010485",
        "codIpm": "40301567"
      },
      {
        "nome": "CROMO",
        "marca": "",
        "codIssec": "28150139",
        "codIpm": "40313310"
      },
      {
        "nome": "FERRITINA",
        "marca": "",
        "codIssec": "28010795",
        "codIpm": "40316270"
      },
      {
        "nome": "FERRO SERICO",
        "marca": "",
        "codIssec": "28010809",
        "codIpm": "40301842"
      },
      {
        "nome": "FOLATO ERITROCITARIO",
        "marca": "**",
        "codIssec": "",
        "codIpm": "40301087"
      },
      {
        "nome": "FOSFORO",
        "marca": "",
        "codIssec": "28010892",
        "codIpm": "40301931"
      },
      {
        "nome": "INDICE DE SATURACAO DA TRANSFERRINA",
        "marca": "",
        "codIssec": "28011384",
        "codIpm": "40302520"
      },
      {
        "nome": "LITIO",
        "marca": "",
        "codIssec": "28011112",
        "codIpm": "40302229"
      },
      {
        "nome": "MAGNESIO",
        "marca": "",
        "codIssec": "28011120",
        "codIpm": "40302237"
      },
      {
        "nome": "POTASSIO",
        "marca": "",
        "codIssec": "28011210",
        "codIpm": "40302318"
      },
      {
        "nome": "SELENIO",
        "marca": "",
        "codIssec": "",
        "codIpm": "40313255"
      },
      {
        "nome": "SODIO",
        "marca": "",
        "codIssec": "28011279",
        "codIpm": "40302423"
      },
      {
        "nome": "TRANSFERRINA",
        "marca": "",
        "codIssec": "28011384",
        "codIpm": "40302520"
      },
      {
        "nome": "VITAMINA A",
        "marca": "**",
        "codIssec": "",
        "codIpm": "40302601"
      },
      {
        "nome": "VITAMINA B12",
        "marca": "",
        "codIssec": "28011449",
        "codIpm": "40316572"
      },
      {
        "nome": "VITAMINA C",
        "marca": "",
        "codIssec": "",
        "codIpm": "40301060"
      },
      {
        "nome": "VITAMINA E",
        "marca": "**",
        "codIssec": "",
        "codIpm": "40302610"
      },
      {
        "nome": "ZINCO SERICO",
        "marca": "",
        "codIssec": "28150260",
        "codIpm": "40313328"
      }
    ]
  },
  {
    "nome": "MARCADORES TUMORAIS",
    "exames": [
      {
        "nome": "ALFA FETO PROTEINA",
        "marca": "",
        "codIssec": "28010213",
        "codIpm": "40316068"
      },
      {
        "nome": "CA 125",
        "marca": "",
        "codIssec": "28061608",
        "codIpm": "40316378"
      },
      {
        "nome": "CA 15-3",
        "marca": "",
        "codIssec": "28061667",
        "codIpm": "40316378"
      },
      {
        "nome": "CA 19-9",
        "marca": "",
        "codIssec": "28061594",
        "codIpm": "40316378"
      },
      {
        "nome": "CA 72-4",
        "marca": "",
        "codIssec": "28061748",
        "codIpm": "40316378"
      },
      {
        "nome": "CEA",
        "marca": "",
        "codIssec": "28060229",
        "codIpm": "40316122"
      },
      {
        "nome": "GASTRINA",
        "marca": "",
        "codIssec": "28050320",
        "codIpm": "40316297"
      },
      {
        "nome": "PSA LIVRE",
        "marca": "**",
        "codIssec": "",
        "codIpm": "40316130"
      },
      {
        "nome": "PSA TOTAL",
        "marca": "",
        "codIssec": "28061624",
        "codIpm": "40316149"
      }
    ]
  },
  {
    "nome": "SOROLOGIAS INFECCIOSAS",
    "exames": [
      {
        "nome": "ANTI HBE",
        "marca": "",
        "codIssec": "28060075",
        "codIpm": "40306976"
      },
      {
        "nome": "ANTI HBS",
        "marca": "",
        "codIssec": "28060083",
        "codIpm": "40306992"
      },
      {
        "nome": "BRUCELOSE",
        "marca": "",
        "codIssec": "28060270",
        "codIpm": "40306526"
      },
      {
        "nome": "CHAGAS - ANTICORPOS IGG",
        "marca": "",
        "codIssec": "28060318",
        "codIpm": "40306615"
      },
      {
        "nome": "CHAGAS - ANTICORPOS IGM",
        "marca": "",
        "codIssec": "28060326",
        "codIpm": "40306623"
      },
      {
        "nome": "CHLAMYDIA TRACHOMATIS IGA",
        "marca": "*",
        "codIssec": "28100131",
        "codIpm": ""
      },
      {
        "nome": "CHLAMYDIA TRACHOMATIS IGG",
        "marca": "",
        "codIssec": "28060342",
        "codIpm": "40306631"
      },
      {
        "nome": "CHLAMYDIA TRACHOMATIS IGM",
        "marca": "",
        "codIssec": "28060342",
        "codIpm": "40306640"
      },
      {
        "nome": "CISTICERCOSE IGG",
        "marca": "",
        "codIssec": "28061020",
        "codIpm": "40306658"
      },
      {
        "nome": "CITOMEGALOVIRUS IGG",
        "marca": "",
        "codIssec": "28060377",
        "codIpm": "40306666"
      },
      {
        "nome": "CITOMEGALOVIRUS IGM",
        "marca": "",
        "codIssec": "28061640",
        "codIpm": "40306674"
      },
      {
        "nome": "DENGUE IGG",
        "marca": "",
        "codIssec": "",
        "codIpm": "40306798"
      },
      {
        "nome": "DENGUE IGM",
        "marca": "",
        "codIssec": "",
        "codIpm": "40306798"
      },
      {
        "nome": "EPSTEIN BAAR VIRUS IGG",
        "marca": "",
        "codIssec": "28061357",
        "codIpm": "40307573"
      },
      {
        "nome": "EPSTEIN BAAR VIRUS IGM",
        "marca": "",
        "codIssec": "28061357",
        "codIpm": "40307581"
      },
      {
        "nome": "FTA-ABS IGG",
        "marca": "",
        "codIssec": "28060520",
        "codIpm": "40307735"
      },
      {
        "nome": "FTA-ABS IGM",
        "marca": "",
        "codIssec": "28060520",
        "codIpm": "40307743"
      },
      {
        "nome": "HBSAG - ANTIGENO AUSTRALIA",
        "marca": "",
        "codIssec": "28060210",
        "codIpm": "40307018"
      },
      {
        "nome": "HELICOBACTER PYLORI IGG",
        "marca": "",
        "codIssec": "28062183",
        "codIpm": "40306917"
      },
      {
        "nome": "HELICOBACTER PYLORI IGM",
        "marca": "",
        "codIssec": "28062183",
        "codIpm": "40306925"
      },
      {
        "nome": "HEPATITE A IGG",
        "marca": "",
        "codIssec": "28060105",
        "codIpm": "40306933"
      },
      {
        "nome": "HEPATITE A IGM",
        "marca": "",
        "codIssec": "28060113",
        "codIpm": "40306941"
      },
      {
        "nome": "HEPATITE ANTI HBC IGG",
        "marca": "",
        "codIssec": "28060067",
        "codIpm": "40306950"
      },
      {
        "nome": "HEPATITE ANTI HBC IGM",
        "marca": "",
        "codIssec": "28061195",
        "codIpm": "40306968"
      },
      {
        "nome": "HEPATITE C - ANTI HCV",
        "marca": "",
        "codIssec": "28061659",
        "codIpm": "40307026"
      },
      {
        "nome": "HEPATITE D",
        "marca": "*",
        "codIssec": "28061160",
        "codIpm": ""
      },
      {
        "nome": "HERPES SIMPLEX 1 E 2 IGG",
        "marca": "",
        "codIssec": "28061373",
        "codIpm": "40307085"
      },
      {
        "nome": "HERPES SIMPLEX 1 E 2 IGM",
        "marca": "",
        "codIssec": "28061381",
        "codIpm": "40307093"
      },
      {
        "nome": "HISTOPLASMOSE",
        "marca": "",
        "codIssec": "28060571",
        "codIpm": "40307158"
      },
      {
        "nome": "HIV 1 E 2",
        "marca": "",
        "codIssec": "28061691",
        "codIpm": "40307182"
      },
      {
        "nome": "HTLV 1/2",
        "marca": "",
        "codIssec": "28061535",
        "codIpm": "40307212"
      },
      {
        "nome": "LEISHMANIOSE IGG",
        "marca": "",
        "codIssec": "28060695",
        "codIpm": "40307395"
      },
      {
        "nome": "LEISHMANIOSE IGM",
        "marca": "",
        "codIssec": "28060695",
        "codIpm": "40307395"
      },
      {
        "nome": "LEPTOSPIROSE IGM",
        "marca": "",
        "codIssec": "28060709",
        "codIpm": "40307417"
      },
      {
        "nome": "MONONUCLEOSE - MONOTEST",
        "marca": "",
        "codIssec": "28060806",
        "codIpm": "40308340"
      },
      {
        "nome": "MYCOPLASMA PNEUMONIAE",
        "marca": "",
        "codIssec": "28062329",
        "codIpm": "40307530"
      },
      {
        "nome": "PARVOVIRUS B19 IGG",
        "marca": "",
        "codIssec": "28170245",
        "codIpm": "40307611"
      },
      {
        "nome": "RUBEOLA IGG",
        "marca": "",
        "codIssec": "28060911",
        "codIpm": "40307697"
      },
      {
        "nome": "RUBEOLA IGM",
        "marca": "",
        "codIssec": "28060903",
        "codIpm": "40307700"
      },
      {
        "nome": "SARAMPO IGG",
        "marca": "",
        "codIssec": "28060920",
        "codIpm": "40308120"
      },
      {
        "nome": "SARAMPO IGM",
        "marca": "",
        "codIssec": "28060920",
        "codIpm": "40308138"
      },
      {
        "nome": "TOXOCARA IGG",
        "marca": "",
        "codIssec": "28061578",
        "codIpm": "40307794"
      },
      {
        "nome": "TOXOPLASMOSE IGG",
        "marca": "",
        "codIssec": "28061497",
        "codIpm": "40307824"
      },
      {
        "nome": "TOXOPLASMOSE IGM",
        "marca": "",
        "codIssec": "28061497",
        "codIpm": "40307832"
      },
      {
        "nome": "VARICELA ZOSTER IGG",
        "marca": "",
        "codIssec": "28061500",
        "codIpm": "40308162"
      },
      {
        "nome": "VARICELA ZOSTER IGM",
        "marca": "",
        "codIssec": "28061500",
        "codIpm": "40308170"
      },
      {
        "nome": "VDRL",
        "marca": "",
        "codIssec": "28061004",
        "codIpm": "40307760"
      }
    ]
  },
  {
    "nome": "AUTOIMUNIDADE E REUMATOLOGIA",
    "exames": [
      {
        "nome": "ANTI CARDIOLIPINA IGA",
        "marca": "",
        "codIssec": "28061780",
        "codIpm": "40306135"
      },
      {
        "nome": "ANTI CARDIOLIPINA IGG",
        "marca": "",
        "codIssec": "28061705",
        "codIpm": "40306143"
      },
      {
        "nome": "ANTI CARDIOLIPINA IGM",
        "marca": "",
        "codIssec": "28061705",
        "codIpm": "40306151"
      },
      {
        "nome": "ANTI DNA",
        "marca": "",
        "codIssec": "28060040",
        "codIpm": "40306062"
      },
      {
        "nome": "ANTI ENA",
        "marca": "*",
        "codIssec": "28060059",
        "codIpm": ""
      },
      {
        "nome": "ANTI ENDOMISIO IGA/IGG/IGM",
        "marca": "**",
        "codIssec": "",
        "codIpm": "40306259"
      },
      {
        "nome": "ANTI ESCLERODERMA SCL70",
        "marca": "",
        "codIssec": "28061730",
        "codIpm": "40306291"
      },
      {
        "nome": "ANTI FOSFOLIPIDES IGG",
        "marca": "*",
        "codIssec": "28010884",
        "codIpm": ""
      },
      {
        "nome": "ANTI GLIADINA IGA",
        "marca": "",
        "codIssec": "28061721",
        "codIpm": "40306305"
      },
      {
        "nome": "ANTI GLIADINA IGG",
        "marca": "**",
        "codIssec": "",
        "codIpm": "40306313"
      },
      {
        "nome": "ANTI GLIADINA IGM",
        "marca": "**",
        "codIssec": "",
        "codIpm": "40306321"
      },
      {
        "nome": "ANTI JO1",
        "marca": "**",
        "codIssec": "",
        "codIpm": "40306070"
      },
      {
        "nome": "ANTI LKM1",
        "marca": "**",
        "codIssec": "",
        "codIpm": "40306097"
      },
      {
        "nome": "ANTI MITOCONDRIA",
        "marca": "",
        "codIssec": "28060121",
        "codIpm": "40306356"
      },
      {
        "nome": "ANTI MUSCULO LISO",
        "marca": "",
        "codIssec": "28060130",
        "codIpm": "40306399"
      },
      {
        "nome": "ANTI RNP",
        "marca": "",
        "codIssec": "28061225",
        "codIpm": "40306100"
      },
      {
        "nome": "ANTI SM",
        "marca": "",
        "codIssec": "28061152",
        "codIpm": "40306127"
      },
      {
        "nome": "ANTI SSA - RO",
        "marca": "",
        "codIssec": "28061136",
        "codIpm": "40306119"
      },
      {
        "nome": "ANTI SSB - LA",
        "marca": "",
        "codIssec": "28061144",
        "codIpm": "40306089"
      },
      {
        "nome": "ANTI-MUSCULO ESTRIADO",
        "marca": "",
        "codIssec": "28061128",
        "codIpm": "40306380"
      },
      {
        "nome": "C-ANCA",
        "marca": "**",
        "codIssec": "",
        "codIpm": "40306402"
      },
      {
        "nome": "CH 50",
        "marca": "",
        "codIssec": "28060229",
        "codIpm": "40306747"
      },
      {
        "nome": "COMPLEMENTO C1Q",
        "marca": "",
        "codIssec": "28060660",
        "codIpm": "40306534"
      },
      {
        "nome": "COMPLEMENTO C2",
        "marca": "",
        "codIssec": "28060385",
        "codIpm": "40306690"
      },
      {
        "nome": "COMPLEMENTO C3",
        "marca": "",
        "codIssec": "28060385",
        "codIpm": "40306704"
      },
      {
        "nome": "COMPLEMENTO C4",
        "marca": "",
        "codIssec": "28060393",
        "codIpm": "40306712"
      },
      {
        "nome": "FAN - FATOR ANTINUCLEAR",
        "marca": "",
        "codIssec": "28060148",
        "codIpm": "40306852"
      },
      {
        "nome": "P-ANCA",
        "marca": "",
        "codIssec": "",
        "codIpm": "40306410"
      },
      {
        "nome": "PESQUISA DE ANTICOAGULANTE LUPICO",
        "marca": "",
        "codIssec": "28040023",
        "codIpm": "40304019"
      },
      {
        "nome": "PROTEINA C - FUNCIONAL",
        "marca": "",
        "codIssec": "",
        "codIpm": "40304507"
      },
      {
        "nome": "PROTEINA S FUNCIONAL",
        "marca": "",
        "codIssec": "",
        "codIpm": "40304515"
      }
    ]
  },
  {
    "nome": "IMUNOGLOBULINAS",
    "exames": [
      {
        "nome": "BETA 2 MICROGLOBULINA",
        "marca": "",
        "codIssec": "28061276",
        "codIpm": "40306470"
      },
      {
        "nome": "IGA",
        "marca": "",
        "codIssec": "28060598",
        "codIpm": "40307220"
      },
      {
        "nome": "IGD",
        "marca": "",
        "codIssec": "28060610",
        "codIpm": "40307247"
      },
      {
        "nome": "IGE TOTAL",
        "marca": "",
        "codIssec": "28060601",
        "codIpm": "40307271"
      },
      {
        "nome": "IGG",
        "marca": "",
        "codIssec": "28060610",
        "codIpm": "40307280"
      },
      {
        "nome": "IGM",
        "marca": "",
        "codIssec": "28060628",
        "codIpm": "40307301"
      },
      {
        "nome": "SUBCLASSE IGG (1,2,3,4)",
        "marca": "",
        "codIssec": "",
        "codIpm": "40307298"
      }
    ]
  },
  {
    "nome": "MARCADORES CARDÍACOS E MUSCULARES",
    "exames": [
      {
        "nome": "BNP / PROBNP - PEPTIDEO NATRIURETICO",
        "marca": "",
        "codIssec": "28011686",
        "codIpm": "40302776"
      },
      {
        "nome": "CKMB-MASSA (CREATINO FOSFOCINASE MB)",
        "marca": "**",
        "codIssec": "",
        "codIpm": "40301656"
      },
      {
        "nome": "CPK - CREATINOFOSFOQUINASE",
        "marca": "",
        "codIssec": "28010558",
        "codIpm": "40301648"
      },
      {
        "nome": "DESIDROGENASE LATICA - LDH",
        "marca": "",
        "codIssec": "28010655",
        "codIpm": "40301729"
      },
      {
        "nome": "MIOGLOBINA",
        "marca": "**",
        "codIssec": "",
        "codIpm": "40311341"
      },
      {
        "nome": "TROPONINA I",
        "marca": "",
        "codIssec": "",
        "codIpm": "40302571"
      }
    ]
  },
  {
    "nome": "PARASITOLOGIA E COPROLÓGICO",
    "exames": [
      {
        "nome": "COPROCULTURA (FEZES)",
        "marca": "",
        "codIssec": "28030010",
        "codIpm": "40310175"
      },
      {
        "nome": "GORDURA FECAL - PESQUISA",
        "marca": "",
        "codIssec": "28030079",
        "codIpm": "40303055"
      },
      {
        "nome": "PARASITOLOGICO DE FEZES",
        "marca": "",
        "codIssec": "28030141",
        "codIpm": "40303110"
      },
      {
        "nome": "SANGUE OCULTO NAS FEZES",
        "marca": "",
        "codIssec": "28030176",
        "codIpm": "40303136"
      }
    ]
  },
  {
    "nome": "ANDROLOGIA",
    "exames": [
      {
        "nome": "ANTI ESPERMATOZOIDES",
        "marca": "",
        "codIssec": "28020014",
        "codIpm": "40309304"
      },
      {
        "nome": "ESPERMOGRAMA",
        "marca": "",
        "codIssec": "28020022",
        "codIpm": "40309312"
      }
    ]
  },
  {
    "nome": "DOSAGENS URINÁRIAS ESPECIAIS",
    "exames": [
      {
        "nome": "ACIDO VANIL MANDELICO",
        "marca": "",
        "codIssec": "28050010",
        "codIpm": "40316033"
      },
      {
        "nome": "CATECOLAMINAS PLASMATICAS",
        "marca": "",
        "codIssec": "28050088",
        "codIpm": "40316181"
      },
      {
        "nome": "CATECOLAMINAS URINARIAS 24H",
        "marca": "",
        "codIssec": "28050088",
        "codIpm": "40311058"
      },
      {
        "nome": "METANEFRINAS URINARIAS 24H",
        "marca": "",
        "codIssec": "28130448",
        "codIpm": "40311163"
      }
    ]
  },
  {
    "nome": "INFLAMAÇÃO E MARCADORES GERAIS",
    "exames": [
      {
        "nome": "ADENOSINA DEAMINASE - ADA",
        "marca": "",
        "codIssec": "28060040",
        "codIpm": "40309010"
      },
      {
        "nome": "ALDOLASE",
        "marca": "",
        "codIssec": "28010205",
        "codIpm": "40301230"
      },
      {
        "nome": "D-DIMERO",
        "marca": "",
        "codIssec": "40304906",
        "codIpm": "40304906"
      },
      {
        "nome": "HOMOCISTEINA",
        "marca": "",
        "codIssec": "",
        "codIpm": "40302113"
      },
      {
        "nome": "PCR (ULTRA-SENSIVEL)",
        "marca": "",
        "codIssec": "28060865",
        "codIpm": "40308391"
      },
      {
        "nome": "PCR PROTEINA C REATIVA",
        "marca": "",
        "codIssec": "28060873",
        "codIpm": "40308383"
      }
    ]
  },
  {
    "nome": "OUTROS EXAMES",
    "exames": [
      {
        "nome": "ACIDO CITRICO (CITRATURIA)",
        "marca": "",
        "codIssec": "28010035",
        "codIpm": "40311015"
      },
      {
        "nome": "ACIDO DELTA AMINO LEVULINICO",
        "marca": "",
        "codIssec": "28150015",
        "codIpm": "40313018"
      },
      {
        "nome": "ACIDO HIPURICO / TOLUENO URINARIO",
        "marca": "",
        "codIssec": "28150040",
        "codIpm": "40313042"
      },
      {
        "nome": "ACIDO LACTICO-LACTATO",
        "marca": "",
        "codIssec": "28010116",
        "codIpm": "40301109"
      },
      {
        "nome": "ACIDO OXALICO - OXALATO",
        "marca": "",
        "codIssec": "28010132",
        "codIpm": "40301125"
      },
      {
        "nome": "ACIDO VALPROICO",
        "marca": "",
        "codIssec": "28010183",
        "codIpm": "40301168"
      },
      {
        "nome": "ADDIS - CONTAGEM",
        "marca": "",
        "codIssec": "28130065",
        "codIpm": "40311295"
      },
      {
        "nome": "ALFA 1 ANTITRIPSINA - SORO",
        "marca": "",
        "codIssec": "28010221",
        "codIpm": "40301249"
      },
      {
        "nome": "ALFA 1 GLICOPROTEINA ACIDA",
        "marca": "",
        "codIssec": "28010230",
        "codIpm": "40301257"
      },
      {
        "nome": "ANALISE DO CALCULO VESICULAR",
        "marca": "*",
        "codIssec": "28060040",
        "codIpm": ""
      },
      {
        "nome": "ANGIOTENSINA CONVERTASE - ECA",
        "marca": "",
        "codIssec": "28050835",
        "codIpm": "40305287"
      },
      {
        "nome": "ANTIBIOGRAMA",
        "marca": "",
        "codIssec": "28100034",
        "codIpm": "40310418"
      },
      {
        "nome": "ANTIGENO HTL-III EIE",
        "marca": "*",
        "codIssec": "28061535",
        "codIpm": ""
      },
      {
        "nome": "ASO - ANTIESTREPTOLISINA O",
        "marca": "",
        "codIssec": "28060180",
        "codIpm": "40308405"
      },
      {
        "nome": "BAAR",
        "marca": "",
        "codIssec": "28100069",
        "codIpm": "40310051"
      },
      {
        "nome": "BACTERIOSCOPIA",
        "marca": "",
        "codIssec": "28100093",
        "codIpm": "40310060"
      },
      {
        "nome": "BETA HCG QUANTITATIVO",
        "marca": "",
        "codIssec": "28050347",
        "codIpm": "40305767"
      },
      {
        "nome": "BIOPSIA",
        "marca": "*",
        "codIssec": "21010021",
        "codIpm": ""
      },
      {
        "nome": "CADMIO URINARIO",
        "marca": "*",
        "codIssec": "28150295",
        "codIpm": ""
      },
      {
        "nome": "CARBAMAZEPINA",
        "marca": "",
        "codIssec": "28010353",
        "codIpm": "40301435"
      },
      {
        "nome": "CARIOTIPO BANDA G",
        "marca": "*",
        "codIssec": "26020025",
        "codIpm": ""
      },
      {
        "nome": "CAXUMBA IGG",
        "marca": "",
        "codIssec": "28060296",
        "codIpm": "40306593"
      },
      {
        "nome": "CAXUMBA IGM",
        "marca": "",
        "codIssec": "28060296",
        "codIpm": "40306607"
      },
      {
        "nome": "CD3",
        "marca": "*",
        "codIssec": "28060733",
        "codIpm": ""
      },
      {
        "nome": "CD4",
        "marca": "",
        "codIssec": "28060733",
        "codIpm": "40307433"
      },
      {
        "nome": "CD8 - LINFOCITOS",
        "marca": "",
        "codIssec": "28060741",
        "codIpm": "40307441"
      },
      {
        "nome": "CITOLOGIA ONCÓTICA VAGINAL (PAPANICOLAU)",
        "marca": "",
        "codIssec": "21010056",
        "codIpm": "40601137"
      },
      {
        "nome": "COLINESTERASE",
        "marca": "",
        "codIssec": "28010523",
        "codIpm": "40313115"
      },
      {
        "nome": "CULTURA (GERAL)",
        "marca": "",
        "codIssec": "28100581",
        "codIpm": "40310124"
      },
      {
        "nome": "FOSFATASE ACIDA PROSTATICA",
        "marca": "",
        "codIssec": "28010841",
        "codIpm": "40301869"
      },
      {
        "nome": "G6PD",
        "marca": "",
        "codIssec": "28010981",
        "codIpm": "40302059"
      },
      {
        "nome": "GASTRINA",
        "marca": "",
        "codIssec": "28050320",
        "codIpm": "40316297"
      },
      {
        "nome": "GRUPO SANGUINEO",
        "marca": "",
        "codIssec": "28040350",
        "codIpm": "40304299"
      },
      {
        "nome": "HOMOCISTEINA",
        "marca": "",
        "codIssec": "",
        "codIpm": "40302113"
      },
      {
        "nome": "IGA",
        "marca": "",
        "codIssec": "28060598",
        "codIpm": "40307220"
      },
      {
        "nome": "IGD",
        "marca": "",
        "codIssec": "28060610",
        "codIpm": "40307247"
      },
      {
        "nome": "IGE TOTAL",
        "marca": "",
        "codIssec": "28060601",
        "codIpm": "40307271"
      },
      {
        "nome": "IGG",
        "marca": "",
        "codIssec": "28060610",
        "codIpm": "40307280"
      },
      {
        "nome": "IGM",
        "marca": "",
        "codIssec": "28060628",
        "codIpm": "40307301"
      },
      {
        "nome": "INIBIDOR DE C1 ESTERASE",
        "marca": "**",
        "codIssec": "",
        "codIpm": "40307344"
      },
      {
        "nome": "LATEX - FATOR REUMATOIDE",
        "marca": "",
        "codIssec": "28060504",
        "codIpm": "40308030"
      }
    ]
  }
];

export const PAINEIS_MARKDOWN: Record<string, { nome: string, exames: string[], justificativa: string }> = {
  "Rastreio Geriátrico Completo": {
    "nome": "Rastreio Geriátrico Completo",
    "exames": [
      "HEMOGRAMA COMPLETO",
      "HEMOGLOBINA GLICADA - HBA1C",
      "GLICOSE",
      "UREIA",
      "CREATININA",
      "TGO - TRANSAMINASE ASPARTICA",
      "TGP - TRANSAMINASE ALANINA",
      "LIPIDOGRAMA",
      "TSH",
      "T4 LIVRE - TIROXINA LIVRE",
      "VITAMINA B12",
      "25-HIDROXIVITAMINA D",
      "CALCIO IONICO",
      "SODIO",
      "POTASSIO",
      "PTH - PARATORMONIO",
      "SUMARIO DE URINA"
    ],
    "justificativa": "Avaliação geriátrica ampla. Rastreio de anemias, função renal, tireoidiana e hepática. Investigação de deficiências vitamínicas (B12, D, Ácido fólico), osteoporose e risco cardiovascular. Avaliação prostática e de marcadores tumorais gerais para idade. Rastreio cognitivo metabólico."
  },
  "Rastreio Gastroenterológico": {
    "nome": "Rastreio Gastroenterológico",
    "exames": [
      "HEMOGRAMA COMPLETO",
      "TGO - TRANSAMINASE ASPARTICA",
      "TGP - TRANSAMINASE ALANINA",
      "FOSFATASE ALCALINA",
      "GGT - GAMA GLUTAMIL TRANSFERASE",
      "BILIRRUBINAS",
      "ALBUMINA",
      "UREIA",
      "CREATININA",
      "GLICOSE",
      "VITAMINA B12",
      "ACIDO FOLICO",
      "ADENOSINA DEAMINASE - ADA",
      "SANGUE OCULTO NAS FEZES",
      "PARASITOLOGICO DE FEZES",
      "HELICOBACTER PYLORI IGG"
    ],
    "justificativa": "Investigação de queixa dispéptica / dor abdominal / alteração de hábito intestinal com perda ponderal. Hepatograma com perfil ferro (rastreio hemocromatose/esteatose), função pancreática, doença celíaca (anti-gliadina/anti-endomísio), sorologias hepatites A/B/C, H. pylori, perfil nutricional, parasitológico/sangue oculto. Marcadores TGI (CEA, CA 19-9, CA 72-4, AFP)"
  },
  "Síndrome Metabólica": {
    "nome": "Síndrome Metabólica",
    "exames": [
      "HEMOGLOBINA GLICADA - HBA1C",
      "GLICOSE",
      "INSULINA",
      "CURVA DE GLICOSE E INSULINA",
      "LIPIDOGRAMA",
      "COLESTEROL TOTAL",
      "COLESTEROL HDL",
      "COLESTEROL LDL",
      "TRIGLICERIDEOS",
      "CORTISOL",
      "DHEA - DEHIDROEPIANDROSTERONA",
      "S-DHEA (DHEA-S)"
    ],
    "justificativa": ""
  },
  "Painel Hormonal Feminino Completo": {
    "nome": "Painel Hormonal Feminino Completo",
    "exames": [
      "FSH",
      "LH",
      "ESTRADIOL E2",
      "PROGESTERONA",
      "PROLACTINA",
      "BIG PROLACTINA",
      "TESTOSTERONA TOTAL",
      "TESTOSTERONA LIVRE",
      "DHEA - DEHIDROEPIANDROSTERONA",
      "S-DHEA (DHEA-S)",
      "ANDROSTENEDIONA",
      "SHBG"
    ],
    "justificativa": ""
  },
  "Painel Hormonal Masculino / TRT": {
    "nome": "Painel Hormonal Masculino / TRT",
    "exames": [
      "TESTOSTERONA TOTAL",
      "TESTOSTERONA LIVRE",
      "DHT - DIHIDROTESTOSTERONA",
      "LH",
      "FSH",
      "PROLACTINA",
      "SHBG",
      "ESTRADIOL E2",
      "PSA TOTAL",
      "PSA LIVRE",
      "HEMATOCRITO"
    ],
    "justificativa": ""
  },
  "Painel Tireoidiano Completo": {
    "nome": "Painel Tireoidiano Completo",
    "exames": [
      "TSH",
      "T4 LIVRE - TIROXINA LIVRE",
      "T4 TOTAL - TIROXINA",
      "T3 TOTAL - TRIIODOTIRONINA",
      "T3 LIVRE",
      "T3 REVERSO",
      "ANTI-MICROSSOMAL - ANTI TPO",
      "ANTI TIREOGLOBULINA",
      "TIREOGLOBULINA",
      "TRAB - ANTI RECEPTOR TSH"
    ],
    "justificativa": "Avaliação tireoidiana completa. Rastreio de hipotireoidismo/hipertireoidismo, tireoidite de Hashimoto (Anti-TPO, Anti-Tireoglobulina), doença de Graves (TRAb), monitoramento de disfunção tireoidiana e investigação de nódulos tireoidianos."
  },

  "♂ Geriatria Completo": {
    "nome": "♂ Geriatria Completo",
    "exames": [
      // ── Hematologia e Coagulação ──
      "HEMOGRAMA COMPLETO",
      "VHS - HEMOSSEDIMENTACAO",
      "RETICULOCITOS - CONTAGEM",
      "COAGULOGRAMA",
      "TEMPO DE PROTROMBINA - TAP",
      "TEMPO DE TROMBOPLASTINA PARCIAL ATIVADO - TTPA",
      "FIBRINOGENIO",
      // ── Glicemia e Metabolismo ──
      "GLICOSE",
      "HEMOGLOBINA GLICADA - HBA1C",
      "INSULINA",
      "PEPTIDEO C",
      "FRUTOSAMINA",
      // ── Perfil Lipídico ──
      "LIPIDOGRAMA",
      "COLESTEROL TOTAL",
      "COLESTEROL HDL",
      "COLESTEROL LDL",
      "COLESTEROL VLDL",
      "TRIGLICERIDEOS",
      "APOLIPOPROTEINA A",
      "APOLIPOPROTEINA B",
      // ── Função Renal e Urina ──
      "UREIA",
      "CREATININA",
      "ACIDO URICO",
      "CLEARANCE DE CREATININA",
      "SUMARIO DE URINA",
      "MICROALBUMINURIA 24H",
      // ── Função Hepática e Pancreática ──
      "TGO - TRANSAMINASE ASPARTICA",
      "TGP - TRANSAMINASE ALANINA",
      "GAMA GLUTAMIL TRANSFERASE - GGT",
      "FOSFATASE ALCALINA",
      "BILIRRUBINAS",
      "ALBUMINA",
      "PROTEINAS TOTAIS E FRACOES",
      "AMILASE",
      "LIPASE",
      // ── Tireoide ──
      "TSH",
      "T4 LIVRE - TIROXINA LIVRE",
      "ANTI-MICROSSOMAL - ANTI TPO",
      // ── Minerais, Vitaminas e Oligoelementos ──
      "VITAMINA B12",
      "ACIDO FOLICO",
      "25-HIDROXIVITAMINA D (VIT D25)",
      "CALCIO IONICO",
      "SODIO",
      "POTASSIO",
      "MAGNESIO",
      "FOSFORO",
      "FERRITINA",
      "FERRO SERICO",
      "TRANSFERRINA",
      "INDICE DE SATURACAO DA TRANSFERRINA",
      "ZINCO SERICO",
      // ── Hormônios Masculinos ──
      "TESTOSTERONA TOTAL",
      "TESTOSTERONA LIVRE",
      "DHT - DIHIDROTESTOSTERONA",
      "SHBG - GLOBULINA LIGADORA DE HORMONIOS SEXUAIS",
      "LH - HORMONIO LUTEINIZANTE",
      "FSH - H. FOLICULO ESTIMULANTE",
      "PROLACTINA",
      "ESTRADIOL E2",
      "DHEA - DEHIDROEPIANDROSTERONA",
      "S-DHEA (DHEA-S)",
      "CORTISOL",
      "PARATORMONIO - PTH",
      // ── Próstata ──
      "PSA TOTAL",
      "PSA LIVRE",
      "FOSFATASE ACIDA PROSTATICA",
      // ── Marcadores Tumorais ──
      "CEA",
      "CA 19-9",
      "ALFA FETO PROTEINA",
      // ── Gastro (componente geriátrico) ──
      "SANGUE OCULTO NAS FEZES",
      "PARASITOLOGICO DE FEZES",
      "HELICOBACTER PYLORI IGG",
      "GASTRINA",
      // ── Marcadores Cardíacos e Inflamatórios ──
      "CPK - CREATINOFOSFOQUINASE",
      "BNP / PROBNP - PEPTIDEO NATRIURETICO",
      "D-DIMERO",
      "PCR (ULTRA-SENSIVEL)",
      "HOMOCISTEINA",
      "DESIDROGENASE LATICA - LDH"
    ],
    "justificativa": "Avaliação geriátrica masculina ampla. Rastreio de anemias (Hemograma, Ferritina, B12, Ácido Fólico), função renal (TFG estimada/Clearance Cr, Microalbuminúria), hepática (Hepatograma completo), tireoidiana (TSH, T4L, Anti-TPO), metabólica (HbA1c, Insulina, Lipidograma, Glicemia) e óssea (PTH, Vit D, Ca Iônico). Avaliação hormonal masculina completa com rastreio de hipogonadismo (Testosterona, SHBG, LH, FSH) e próstata (PSA Total e Livre). Componente gastroenterológico com H. Pylori, Sangue Oculto nas Fezes e Gastrina. Marcadores cardiovasculares de risco (BNP, D-Dímero, Homocisteína, PCR-us). Marcadores tumorais de rastreio (CEA, CA 19-9, AFP)."
  },

  "♀ Geriatria Completa": {
    "nome": "♀ Geriatria Completa",
    "exames": [
      // ── Hematologia e Coagulação ──
      "HEMOGRAMA COMPLETO",
      "VHS - HEMOSSEDIMENTACAO",
      "RETICULOCITOS - CONTAGEM",
      "COAGULOGRAMA",
      "TEMPO DE PROTROMBINA - TAP",
      "TEMPO DE TROMBOPLASTINA PARCIAL ATIVADO - TTPA",
      "FIBRINOGENIO",
      "COOMBS DIRETO",
      "ELETROFORESE DE HEMOGLOBINA",
      // ── Glicemia e Metabolismo ──
      "GLICOSE",
      "HEMOGLOBINA GLICADA - HBA1C",
      "INSULINA",
      "PEPTIDEO C",
      "FRUTOSAMINA",
      // ── Perfil Lipídico ──
      "LIPIDOGRAMA",
      "COLESTEROL TOTAL",
      "COLESTEROL HDL",
      "COLESTEROL LDL",
      "COLESTEROL VLDL",
      "TRIGLICERIDEOS",
      "APOLIPOPROTEINA A",
      "APOLIPOPROTEINA B",
      // ── Função Renal e Urina ──
      "UREIA",
      "CREATININA",
      "ACIDO URICO",
      "CLEARANCE DE CREATININA",
      "SUMARIO DE URINA",
      "MICROALBUMINURIA 24H",
      "URINOCULTURA",
      // ── Função Hepática e Pancreática ──
      "TGO - TRANSAMINASE ASPARTICA",
      "TGP - TRANSAMINASE ALANINA",
      "GAMA GLUTAMIL TRANSFERASE - GGT",
      "FOSFATASE ALCALINA",
      "BILIRRUBINAS",
      "ALBUMINA",
      "PROTEINAS TOTAIS E FRACOES",
      "AMILASE",
      "LIPASE",
      // ── Tireoide (Painel Extenso — alta prevalência em mulheres idosas) ──
      "TSH",
      "T4 LIVRE - TIROXINA LIVRE",
      "T4 TOTAL - TIROXINA",
      "T3 LIVRE",
      "ANTI-MICROSSOMAL - ANTI TPO",
      "ANTI TIREOGLOBULINA",
      "TIREOGLOBULINA",
      // ── Minerais, Vitaminas e Oligoelementos ──
      "VITAMINA B12",
      "ACIDO FOLICO",
      "25-HIDROXIVITAMINA D (VIT D25)",
      "CALCIO IONICO",
      "SODIO",
      "POTASSIO",
      "MAGNESIO",
      "FOSFORO",
      "FERRITINA",
      "FERRO SERICO",
      "TRANSFERRINA",
      "INDICE DE SATURACAO DA TRANSFERRINA",
      "ZINCO SERICO",
      "SELENIO",
      // ── Hormônios Femininos Menopáusicos ──
      "FSH - H. FOLICULO ESTIMULANTE",
      "LH - HORMONIO LUTEINIZANTE",
      "ESTRADIOL E2",
      "ESTRONA E1",
      "PROGESTERONA",
      "PROLACTINA",
      "BIG PROLACTINA",
      "TESTOSTERONA TOTAL",
      "TESTOSTERONA LIVRE",
      "DHEA - DEHIDROEPIANDROSTERONA",
      "S-DHEA (DHEA-S)",
      "ANDROSTENEDIONA",
      "SHBG - GLOBULINA LIGADORA DE HORMONIOS SEXUAIS",
      "ACTH - ADRENOCORTICOTROFICO",
      "CORTISOL",
      "PARATORMONIO - PTH",
      // ── Marcadores Tumorais Femininos ──
      "CA 125",
      "CA 15-3",
      "CEA",
      "CA 19-9",
      "ALFA FETO PROTEINA",
      // ── Gastro (componente geriátrico) ──
      "SANGUE OCULTO NAS FEZES",
      "PARASITOLOGICO DE FEZES",
      "HELICOBACTER PYLORI IGG",
      "GASTRINA",
      // ── Autoimunidade (alta prevalência em mulheres idosas) ──
      "FAN - FATOR ANTINUCLEAR",
      "LATEX - FATOR REUMATOIDE",
      "ANTI DNA",
      "COMPLEMENTO C3",
      "COMPLEMENTO C4",
      "ANTI SSA - RO",
      "ANTI SSB - LA",
      // ── Marcadores Cardíacos e Inflamatórios ──
      "CPK - CREATINOFOSFOQUINASE",
      "BNP / PROBNP - PEPTIDEO NATRIURETICO",
      "D-DIMERO",
      "PCR (ULTRA-SENSIVEL)",
      "HOMOCISTEINA",
      "DESIDROGENASE LATICA - LDH"
    ],
    "justificativa": "Avaliação geriátrica feminina ampla. Rastreio de anemias e coagulopatias (Hemograma, Ferritina, B12, Ácido Fólico, Eletroforese de Hb, Coombs), função renal/hepática completa, metabólica (HbA1c, Lipidograma, Insulina). Painel tireoidiano extenso com anticorpos (alta prevalência de Hashimoto em mulheres). Avaliação hormonal pós-menopausa (FSH, LH, Estradiol, Progesterona, Prolactina, DHEA-S, Testosterona, SHBG). Rastreio ósseo (PTH, Vit D25, Cálcio Iônico). Marcadores tumorais femininos (CA 125, CA 15-3, CEA, CA 19-9). Rastreio autoimune (FAN, FR, Anti-DNA, Complemento C3/C4, Anti-Ro, Anti-La). Componente gastroenterológico e marcadores cardiovasculares (BNP, D-Dímero, Homocisteína, PCR-us)."
  },

  "♂ Gastro Completo": {
    "nome": "♂ Gastro Completo",
    "exames": [
      // ── Hematologia ──
      "HEMOGRAMA COMPLETO",
      "VHS - HEMOSSEDIMENTACAO",
      "RETICULOCITOS - CONTAGEM",
      "FERRITINA",
      "FERRO SERICO",
      "TRANSFERRINA",
      "INDICE DE SATURACAO DA TRANSFERRINA",
      // ── Glicemia e Metabolismo base ──
      "GLICOSE",
      "HEMOGLOBINA GLICADA - HBA1C",
      "INSULINA",
      "LIPIDOGRAMA",
      "COLESTEROL TOTAL",
      "COLESTEROL HDL",
      "COLESTEROL LDL",
      "TRIGLICERIDEOS",
      // ── Função Renal e Urina ──
      "UREIA",
      "CREATININA",
      "SUMARIO DE URINA",
      // ── Função Hepática e Pancreática Extenso ──
      "TGO - TRANSAMINASE ASPARTICA",
      "TGP - TRANSAMINASE ALANINA",
      "GAMA GLUTAMIL TRANSFERASE - GGT",
      "FOSFATASE ALCALINA",
      "BILIRRUBINAS",
      "ALBUMINA",
      "PROTEINAS TOTAIS E FRACOES",
      "AMILASE",
      "LIPASE",
      "COAGULOGRAMA",
      "TEMPO DE PROTROMBINA - TAP",
      // ── Sorologias Hepáticas ──
      "HBSAG - ANTIGENO AUSTRALIA",
      "HEPATITE ANTI HBC IGG",
      "HEPATITE ANTI HBC IGM",
      "ANTI HBE",
      "ANTI HBS",
      "HEPATITE C - ANTI HCV",
      "HEPATITE A IGG",
      "HEPATITE A IGM",
      // ── H. Pylori ──
      "HELICOBACTER PYLORI IGG",
      "HELICOBACTER PYLORI IGM",
      // ── Parasitologia e Coprológico ──
      "SANGUE OCULTO NAS FEZES",
      "PARASITOLOGICO DE FEZES",
      "COPROCULTURA (FEZES)",
      "GORDURA FECAL - PESQUISA",
      // ── Nutricional ──
      "VITAMINA B12",
      "ACIDO FOLICO",
      "ALBUMINA",
      "ZINCO SERICO",
      "CALCIO IONICO",
      "MAGNESIO",
      // ── Marcadores Tumorais TGI ──
      "CEA",
      "CA 19-9",
      "CA 72-4",
      "ALFA FETO PROTEINA",
      "GASTRINA",
      // ── Autoimune Hepático/Intestinal ──
      "ANTI MITOCONDRIA",
      "ANTI MUSCULO LISO",
      "FAN - FATOR ANTINUCLEAR",
      "ALFA 1 ANTITRIPSINA - SORO",
      // ── Inflamação/Marcadores Gerais ──
      "PCR (ULTRA-SENSIVEL)",
      "PCR PROTEINA C REATIVA",
      "ADENOSINA DEAMINASE - ADA",
      "D-DIMERO",
      "VHS - HEMOSSEDIMENTACAO",
      // ── Rastreio Prostático (sobreposição geriátrica) ──
      "PSA TOTAL",
      // ── Tireoide base ──
      "TSH"
    ],
    "justificativa": "Investigação gastroenterológica masculina completa. Hepatograma extenso com avaliação de hepatite alcoólica/esteatose (TGO/TGP/GGT/FA/Bilirrubinas/Albumina/TP, Coagulograma). Sorologias completas de hepatites virais A, B (HBsAg, Anti-HBc, Anti-HBe, Anti-HBs) e C (Anti-HCV). Pesquisa de H. pylori (IgG e IgM), rastreio parasitológico, coproscópio com gordura fecal e sangue oculto. Marcadores tumorais TGI: CEA, CA 19-9, CA 72-4, AFP, Gastrina. Perfil autoimune hepático/intestinal (Anti-Mitocôndria, Anti-Músculo Liso, FAN, Alfa-1-Antitripsina). Avaliação nutricional (Albumina, Vitamina B12, Ácido Fólico, Zinco, Magnésio). Componente metabólico (Glicemia, HbA1c, Lipidograma). PCR-us e ADA para inflamação sistêmica. PSA como rastreio oncológico masculino e TSH como base geral."
  },

  "♀ Gastro Completa": {
    "nome": "♀ Gastro Completa",
    "exames": [
      // ── Hematologia ──
      "HEMOGRAMA COMPLETO",
      "VHS - HEMOSSEDIMENTACAO",
      "RETICULOCITOS - CONTAGEM",
      "FERRITINA",
      "FERRO SERICO",
      "TRANSFERRINA",
      "INDICE DE SATURACAO DA TRANSFERRINA",
      "CAPACIDADE DE LIGACAO DO FERRO",
      // ── Glicemia e Metabolismo base ──
      "GLICOSE",
      "HEMOGLOBINA GLICADA - HBA1C",
      "INSULINA",
      "LIPIDOGRAMA",
      "COLESTEROL TOTAL",
      "COLESTEROL HDL",
      "COLESTEROL LDL",
      "TRIGLICERIDEOS",
      // ── Função Renal e Urina ──
      "UREIA",
      "CREATININA",
      "SUMARIO DE URINA",
      // ── Função Hepática e Pancreática Extenso ──
      "TGO - TRANSAMINASE ASPARTICA",
      "TGP - TRANSAMINASE ALANINA",
      "GAMA GLUTAMIL TRANSFERASE - GGT",
      "FOSFATASE ALCALINA",
      "BILIRRUBINAS",
      "ALBUMINA",
      "PROTEINAS TOTAIS E FRACOES",
      "AMILASE",
      "LIPASE",
      "COAGULOGRAMA",
      "TEMPO DE PROTROMBINA - TAP",
      // ── Sorologias Hepáticas ──
      "HBSAG - ANTIGENO AUSTRALIA",
      "HEPATITE ANTI HBC IGG",
      "HEPATITE ANTI HBC IGM",
      "ANTI HBE",
      "ANTI HBS",
      "HEPATITE C - ANTI HCV",
      "HEPATITE A IGG",
      "HEPATITE A IGM",
      // ── H. Pylori ──
      "HELICOBACTER PYLORI IGG",
      "HELICOBACTER PYLORI IGM",
      // ── Parasitologia e Coprológico ──
      "SANGUE OCULTO NAS FEZES",
      "PARASITOLOGICO DE FEZES",
      "COPROCULTURA (FEZES)",
      "GORDURA FECAL - PESQUISA",
      // ── Doença Celíaca (Rastreio Feminino — maior prevalência) ──
      "ANTI GLIADINA IGA",
      "ANTI GLIADINA IGG",
      "ANTI ENDOMISIO IGA/IGG/IGM",
      // ── Nutricional ──
      "VITAMINA B12",
      "ACIDO FOLICO",
      "ZINCO SERICO",
      "CALCIO IONICO",
      "MAGNESIO",
      "25-HIDROXIVITAMINA D (VIT D25)",
      // ── Marcadores Tumorais TGI + Femininos ──
      "CEA",
      "CA 19-9",
      "CA 72-4",
      "ALFA FETO PROTEINA",
      "GASTRINA",
      "CA 125",
      "CA 15-3",
      // ── Autoimune Hepático/Intestinal ──
      "ANTI MITOCONDRIA",
      "ANTI MUSCULO LISO",
      "FAN - FATOR ANTINUCLEAR",
      "ALFA 1 ANTITRIPSINA - SORO",
      "ANTI SSA - RO",
      "ANTI SSB - LA",
      // ── Inflamação/Marcadores Gerais ──
      "PCR (ULTRA-SENSIVEL)",
      "PCR PROTEINA C REATIVA",
      "ADENOSINA DEAMINASE - ADA",
      "D-DIMERO",
      // ── Tireoide base ──
      "TSH",
      "T4 LIVRE - TIROXINA LIVRE",
      "ANTI-MICROSSOMAL - ANTI TPO"
    ],
    "justificativa": "Investigação gastroenterológica feminina completa. Hepatograma extenso com avaliação de hepatite/esteatose (TGO/TGP/GGT/FA/Bilirrubinas/Albumina/TP, Coagulograma). Sorologias completas de hepatites virais A, B e C. Pesquisa de H. pylori (IgG e IgM). Rastreio de Doença Celíaca (Anti-Gliadina IgA/IgG, Anti-Endomísio) — maior prevalência em mulheres. Rastreio parasitológico, gordura fecal e sangue oculto. Marcadores tumorais TGI (CEA, CA 19-9, CA 72-4, AFP, Gastrina) + femininos (CA 125, CA 15-3). Perfil autoimune hepático/intestinal ampliado (Anti-Mitocôndria, Anti-Músculo Liso, FAN, Anti-Ro, Anti-La). Avaliação nutricional (B12, Ácido Fólico, Zinco, Cálcio, Vitamina D). PCR-us, ADA e D-Dímero. Painel tireoidiano base (TSH, T4L, Anti-TPO) dada maior prevalência de disfunção tireoidiana em mulheres com DII."
  }
};

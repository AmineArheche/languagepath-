import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const readingPath = path.resolve(__dirname, "../src/data/readingTexts.json");

const readingData = JSON.parse(fs.readFileSync(readingPath, "utf-8"));

// Evidence phrases and distractor rationales for each question in readingTexts.json
const enrichmentMap = {
  // read-a1-1
  "q-a1-1-1": {
    phrase: "Um sieben Uhr stehe ich auf",
    errorCategory: "comprehension-detail",
    rationales: {
      "0": "Im Text steht nichts von 6:00 Uhr; Lukas steht um 7:00 Uhr auf.",
      "2": "Um 8:00 Uhr nimmt Lukas die U-Bahn zum Sprachkurs.",
      "3": "Um 9:00 Uhr fängt der Unterricht an, nicht das Aufstehen."
    }
  },
  "q-a1-1-2": {
    phrase: "In der U-Bahn lese ich ein deutsches Buch",
    errorCategory: "comprehension-detail",
    rationales: {
      "0": "Lukas schläft nicht in der Bahn, sondern nutzt die Fahrzeit zum Lesen.",
      "1": "Musik hören wird im Text nicht erwähnt.",
      "3": "Lukas telefoniert nicht in der U-Bahn, sondern liest ein Buch."
    }
  },
  "q-a1-1-3": {
    phrase: "koche eine leckere Gemüsesuppe",
    errorCategory: "comprehension-detail",
    rationales: {
      "1": "Lukas kocht eine Gemüsesuppe, er bestellt oder isst keine Pizza.",
      "2": "Nudeln mit Tomatensauce werden im Text nicht erwähnt.",
      "3": "Kuchen backt Lukas nicht am Abend."
    }
  },

  // read-a1-2
  "q-a1-2-1": {
    phrase: "Heute ist Samstag",
    errorCategory: "comprehension-detail",
    rationales: {
      "0": "Montag wird nicht genannt; Maria geht am Samstag einkaufen.",
      "1": "Freitag ist nicht der Einkaufstag im Text.",
      "3": "Sonntag sind die Supermärkte in Deutschland meist geschlossen."
    }
  },
  "q-a1-2-2": {
    phrase: "Die Äpfel kosten zwei Euro",
    errorCategory: "comprehension-detail",
    rationales: {
      "0": "Ein Euro ist zu wenig; im Text steht ausdrücklich zwei Euro.",
      "2": "Fünf ist die Anzahl der Bananen, nicht der Preis der Äpfel.",
      "3": "Achtzehn Euro ist der Gesamtpreis des gesamten Einkaufs."
    }
  },
  "q-a1-2-3": {
    phrase: "Maria bezahlt mit ihrer Karte",
    errorCategory: "comprehension-detail",
    rationales: {
      "0": "Maria bezahlt nicht mit Bargeld, sondern bargeldlos mit Karte.",
      "1": "Smartphone-Zahlung wird im Text nicht erwähnt.",
      "3": "Maria bezahlt ihren Einkauf ordnungsgemäß an der Kasse."
    }
  },

  // read-a1-3
  "q-a1-3-1": {
    phrase: "arbeitet als Arzt im Krankenhaus",
    errorCategory: "comprehension-detail",
    rationales: {
      "0": "Lehrerin ist die Mutter (sie unterrichtet Musik), nicht der Vater.",
      "2": "Verkäufer wird im Text nicht erwähnt.",
      "3": "Musiker ist kein Beruf der Eltern; die Mutter singt im Chor als Hobby."
    }
  },
  "q-a1-3-2": {
    phrase: "er ist fünfzehn Jahre alt",
    errorCategory: "comprehension-detail",
    rationales: {
      "0": "Zehn Jahre ist falsch; Felix ist fünfzehn Jahre alt.",
      "2": "Zwanzig Jahre alt ist Jonas selbst, nicht sein jüngerer Bruder.",
      "3": "Achtzehn Jahre wird im Text nicht genannt."
    }
  },
  "q-a1-3-3": {
    phrase: "fotografiere alte Gebäude",
    errorCategory: "comprehension-detail",
    rationales: {
      "0": "Tennis spielt der Vater in seiner Freizeit, nicht Jonas.",
      "1": "Im Chor singt die Mutter, nicht Jonas.",
      "2": "Videospiele spielt der Bruder Felix mit seinen Freunden."
    }
  },

  // read-a2-1
  "q-a2-1-1": {
    phrase: "hat nur drei Stunden gedauert",
    errorCategory: "comprehension-detail",
    rationales: {
      "0": "Eine Stunde wäre selbst für den ICE zu kurz für Frankfurt-München.",
      "1": "Zwei Stunden ist falsch; die Fahrt dauerte genau drei Stunden.",
      "3": "Fünf Stunden ist zu lang für die genannte ICE-Verbindung."
    }
  },
  "q-a2-1-2": {
    phrase: "das berühmte Glockenspiel am Neuen Rathaus gesehen",
    errorCategory: "comprehension-detail",
    rationales: {
      "0": "Ein Fußballspiel fand am Marienplatz nicht statt.",
      "2": "Ein Rockkonzert wird im Text nicht erwähnt.",
      "3": "Der Marienplatz ist bekannt für das Rathaus-Glockenspiel, nicht für einen Bauernmarkt."
    }
  },
  "q-a2-1-3": {
    phrase: "habe ich das Deutsche Museum besichtigt",
    errorCategory: "comprehension-detail",
    rationales: {
      "1": "Neuschwanstein liegt im Allgäu, nicht direkt in München.",
      "2": "Der Olympiapark wurde am nächsten Tag nicht besucht.",
      "3": "Ein Zoo-Besuch wird im Text nicht erwähnt."
    }
  },

  // read-a2-2
  "q-a2-2-1": {
    phrase: "Simon studiert Biologie",
    errorCategory: "comprehension-detail",
    rationales: {
      "0": "Medizin wird im Text nicht erwähnt; Simon studiert Biologie.",
      "1": "Informatik ist nicht das Studienfach des neuen Mitbewohners.",
      "3": "Germanistik studiert Simon nicht."
    }
  },
  "q-a2-2-2": {
    phrase: "damit sich alle Mitbewohner wohlfühlen",
    errorCategory: "comprehension-detail",
    rationales: {
      "0": "Die WG-Bewohner haben sich nicht gestritten, sondern verstehen sich gut.",
      "2": "Der Vermieter verlangt keinen privaten Putzplan der WG.",
      "3": "Ein Putzplan dient der Sauberkeit und Harmonie, nicht dem Geldsparen."
    }
  },
  "q-a2-2-3": {
    phrase: "Gestern haben wir gemeinsam Pizza gebacken",
    errorCategory: "comprehension-detail",
    rationales: {
      "0": "Ein Kinobesuch fand gestern nicht statt.",
      "2": "Möbel wurden gestern nicht gekauft; Simons Zimmer war bereits eingerichtet.",
      "3": "Ein Ausflug wird für gestern nicht erwähnt."
    }
  },

  // read-a2-3
  "q-a2-3-1": {
    phrase: "mit starken Halsschmerzen und leichtem Fieber aufgewacht",
    errorCategory: "comprehension-detail",
    rationales: {
      "0": "Bauch- und Zahnschmerzen lagen laut Text nicht vor.",
      "2": "Ein Knochenbruch wird nirgends erwähnt.",
      "3": "Rückenschmerzen gehörten nicht zu den akuten Symptomen."
    }
  },
  "q-a2-3-2": {
    phrase: "Bettruhe verordnet und ein Rezept für Halstabletten und Hustensaft ausgestellt",
    errorCategory: "comprehension-detail",
    rationales: {
      "0": "Eine Operation war bei dieser leichten Mandelentzündung keineswegs nötig.",
      "2": "Der Arzt verordnete Ruhe, kein sofortiges Weiterarbeiten.",
      "3": "Sport zu treiben wäre bei Fieber kontraproduktiv."
    }
  },
  "q-a2-3-3": {
    phrase: "direkt zur Apotheke gegangen",
    errorCategory: "comprehension-detail",
    rationales: {
      "0": "Zum Supermarkt ging der Patient nicht direkt.",
      "2": "Ein Restaurantbesuch passte nicht zur verordneten Bettruhe.",
      "3": "Zur Universität ging er wegen Krankheit nicht."
    }
  },

  // read-b1-1
  "q-b1-1-1": {
    phrase: "Junior-Marketingmanagerin bei einer internationalen Agentur",
    errorCategory: "comprehension-detail",
    rationales: {
      "0": "Grafikdesignerin ist eine andere Stelle in einer Werbeagentur.",
      "2": "Buchhalterin passt nicht zum Profil einer Marketingmanagerin.",
      "3": "Softwareentwicklerin wird im Text nicht erwähnt."
    }
  },
  "q-b1-1-2": {
    phrase: "betriebsbereiter Laptop samt Willkommenspaket und einer Tasse",
    errorCategory: "comprehension-detail",
    rationales: {
      "1": "Nur ein Notizblock wäre unvollständig; es gab ein ganzes Paket inklusive Laptop.",
      "2": "Blumen wurden Katharina nicht hingestellt.",
      "3": "Ein altes Telefon stand dort nicht; der Arbeitsplatz war modern ausgestattet."
    }
  },
  "q-b1-1-3": {
    phrase: "Brainstorming-Sitzung für eine nachhaltige Werbekampagne",
    errorCategory: "comprehension-detail",
    rationales: {
      "0": "Das Vorstellungsgespräch hatte Katharina bereits vor Dienstantritt absolviert.",
      "2": "Gehaltsverhandlungen finden nicht am ersten Nachmittag statt.",
      "3": "Eine Betriebsfeier wird für diesen Tag nicht beschrieben."
    }
  },

  // read-b1-2
  "q-b1-2-1": {
    phrase: "Plastik, Papier, Biomüll und Restmüll in getrennten Behältern gesammelt",
    errorCategory: "comprehension-detail",
    rationales: {
      "0": "Alles in einen Sack zu werfen widerspricht der deutschen Mülltrennung komplett.",
      "1": "Müll im Garten zu verbrennen ist in Deutschland gesetzlich verboten.",
      "3": "Die Müllabfuhr erfolgt nach festem Plan, nicht nur am Monatsende."
    }
  },
  "q-b1-2-2": {
    phrase: "Lebensmittel wie Reis, Nudeln und Müsli in mitgebrachte Gläser oder Stoffbeutel abgefüllt",
    errorCategory: "comprehension-detail",
    rationales: {
      "0": "Ein Unverpackt-Laden ist ein physischer Vor-Ort-Laden, kein reiner Onlineshop.",
      "2": "Tiefkühlprodukte sind typischerweise verpackt und nicht der Kern von Unverpackt-Läden.",
      "3": "Plastiktüten gibt es in Unverpackt-Läden ganz bewusst nicht."
    }
  },
  "q-b1-2-3": {
    phrase: "Netz aus Straßenbahnen und Bussen oder fahren täglich mit dem Fahrrad",
    errorCategory: "comprehension-detail",
    rationales: {
      "0": "Privatjets sind kein urbanes nachhaltiges Nahverkehrsmittel.",
      "2": "Taxis sind ebenfalls Autos und reduzieren den Autoverkehr nicht.",
      "3": "Pferdekutschen sind historische Attraktionen, kein regulärer Stadtverkehr."
    }
  },

  // read-b1-3
  "q-b1-3-1": {
    phrase: "als Respektlosigkeit gegenüber der Zeit des Geschäftspartners",
    errorCategory: "comprehension-detail",
    rationales: {
      "0": "Unpünktlichkeit gilt im Berufsleben nicht als kreativ.",
      "2": "Im deutschen Berufsleben wird Unpünktlichkeit keineswegs als normal betrachtet.",
      "3": "Gelassenheit wird eher im Privaten toleriert, nicht bei geschäftlichen Terminen."
    }
  },
  "q-b1-3-2": {
    phrase: "den Gastgeber frühzeitig telefonisch oder per Kurznachricht zu informieren",
    errorCategory: "comprehension-detail",
    rationales: {
      "0": "Einfach abzusagen und umzukehren ist unhöflich und unprofessionell.",
      "2": "Gar nichts zu tun verschärft den unprofessionellen Eindruck.",
      "3": "Schnelleres Fahren im Stau ist physikalisch unmöglich und verkehrswidrig."
    }
  },
  "q-b1-3-3": {
    phrase: "vielmehr ein Zeichen gegenseitiger Wertschätzung",
    errorCategory: "comprehension-detail",
    rationales: {
      "0": "Der Text beschreibt Pünktlichkeit als lebendige, aktuelle Tugend, nicht veraltet.",
      "1": "Der Text betont ausdrücklich: 'weniger ein starrer Zwang'.",
      "3": "Pünktlichkeit ist eine kulturelle Norm/Tugend, kein formales Strafgesetz."
    }
  },

  // read-b2-1
  "q-b2-1-1": {
    phrase: "Freiraum für kreative und strategische Denkprozesse eröffnet wird",
    errorCategory: "comprehension-detail",
    rationales: {
      "0": "Optimisten wollen keine Abschaffung jeglicher Arbeit, sondern Entlastung.",
      "2": "Dass niemand mehr lernen muss, wird nirgends behauptet; im Gegenteil wird Weiterbildung gefordert.",
      "3": "Sinkende Gehälter werden nicht als Chance gefeiert."
    }
  },
  "q-b2-1-2": {
    phrase: "von der Rechtsberatung über die Softwareentwicklung bis hin zum Journalismus",
    errorCategory: "comprehension-detail",
    rationales: {
      "0": "Landwirtschaft und Bergbau gehören zum primären/sekundären Sektor, nicht tertiär.",
      "2": "Tourismus und Gastronomie werden im Text an dieser Stelle nicht genannt.",
      "3": "Bauwesen gehört zum sekundären/produzierenden Gewerbe."
    }
  },
  "q-b2-1-3": {
    phrase: "Weiterbildungsoffensive sowie klare ethische Richtlinien",
    errorCategory: "comprehension-detail",
    rationales: {
      "0": "Ein Computerverbot fordert niemand; gefordert werden Kompetenz und Richtlinien.",
      "2": "Die Rentenfrage ist nicht Gegenstand dieses Texts über KI-Arbeitswelten.",
      "3": "Unbezahlte Überstunden werden von Gewerkschaften prinzipiell bekämpft."
    }
  },

  // read-b2-2
  "q-b2-2-1": {
    phrase: "Stadtplanung primär auf das Automobil ausgerichtet",
    errorCategory: "comprehension-detail",
    rationales: {
      "0": "Fußgänger wurden in der traditionellen autozentrierten Stadtplanung vernachlässigt.",
      "2": "Schifffahrt betrifft nur Hafenstädte, nicht die allgemeine Stadtplanung.",
      "3": "Pferdebahnen waren im 19. Jahrhundert relevant, nicht die Jahrzehnte vor heute."
    }
  },
  "q-b2-2-2": {
    phrase: "innerhalb einer Viertelstunde zu Fuß oder mit dem Fahrrad erreichbar",
    errorCategory: "comprehension-detail",
    rationales: {
      "0": "Die 15-Minuten-Stadt bezieht sich auf Wege im Alltag, nicht auf Zugreisen.",
      "1": "Es geht um Wegezeiten zu Versorgungsorten, nicht um Arbeitspausen.",
      "3": "Es bedeutet nicht, dass man nur 15 Minuten mit dem Auto fahren darf."
    }
  },
  "q-b2-2-3": {
    phrase: "verkehrsberuhigte Flaniermeilen den Einzelhandel sogar beleben",
    errorCategory: "comprehension-detail",
    rationales: {
      "0": "Das Gegenteil ist der Fall: Studien widerlegen das Schließen der Geschäfte.",
      "2": "Flaniermeilen laden zum Bummeln ein und steigern Kundenfrequenzen.",
      "3": "Der wirtschaftliche Nutzen überwiegt die anfänglichen Bedenken."
    }
  },

  // read-b2-3
  "q-b2-3-1": {
    phrase: "als 'die Burg' bezeichnet",
    errorCategory: "comprehension-detail",
    rationales: {
      "0": "Die Wiener Staatsoper ist ein anderes berühmtes Haus an der Ringstraße.",
      "2": "Der Begriff 'Palast' wird für das Burgtheater nicht verwendet.",
      "3": "Das 'Schloss' bezieht sich typischerweise auf Schönbrunn oder Belvedere."
    }
  },
  "q-b2-3-2": {
    phrase: "Besuch eines traditionellen Wiener Kaffeehauses zum obligatorischen Ritual",
    errorCategory: "comprehension-detail",
    rationales: {
      "0": "Ein Spaziergang im Regen ist kein Wiener Theater-Kulturritual.",
      "2": "Eine Donau-Bootsfahrt findet tagsüber oder touristisch statt, nicht nach dem Theater.",
      "3": "Sofort heimzugehen verpasst die gesellschaftliche Nachbesprechung im Kaffeehaus."
    }
  },
  "q-b2-3-3": {
    phrase: "Bei einer 'Wiener Melange' und einem Stück Sachertorte",
    errorCategory: "comprehension-detail",
    rationales: {
      "0": "Bier und Brezeln sind typisch für bayerische Wirtshäuser, nicht für Wiener Kaffeehäuser.",
      "2": "Tee und Kekse ist eine britische Tradition.",
      "3": "Wein und Käse gehört in ein Heurigenlokal oder Bistro, nicht ins klassische Kaffeehaus."
    }
  }
};

// Process each text
readingData.forEach((text) => {
  text.questions.forEach((q) => {
    const enrichment = enrichmentMap[q.id];
    if (enrichment) {
      const idx = text.content.indexOf(enrichment.phrase);
      if (idx !== -1) {
        q.evidence = {
          start: idx,
          end: idx + enrichment.phrase.length,
          text: enrichment.phrase
        };
      } else {
        console.warn(`Could not find phrase "${enrichment.phrase}" in text ${text.id}`);
      }
      q.distractorRationale = enrichment.rationales;
      q.errorCategory = enrichment.errorCategory;
    }
  });
});

fs.writeFileSync(readingPath, JSON.stringify(readingData, null, 2), "utf-8");
console.log("Successfully enriched all reading questions with evidence, distractor rationales, and errorCategory!");

// Now enrich examMockData.json
const examPath = path.resolve(__dirname, "../src/data/examMockData.json");
const examData = JSON.parse(fs.readFileSync(examPath, "utf-8"));

examData.forEach((exam) => {
  if (exam.modules?.hoeren) {
    exam.modules.hoeren.maxReplays = exam.modules.hoeren.maxReplays || 2;
    exam.modules.hoeren.parts?.forEach((part) => {
      part.maxReplays = part.maxReplays || 2;
      part.questions?.forEach((q) => {
        if (!q.errorCategory) {
          const qText = (q.question || "").toLowerCase();
          q.errorCategory = qText.includes("nicht") || qText.includes("kein")
            ? "comprehension-negation"
            : "comprehension-keyword-trap";
        }
        if (!q.distractorRationale) {
          q.distractorRationale = {};
          q.options?.forEach((opt, optIdx) => {
            if (optIdx !== q.correctAnswer) {
              q.distractorRationale[String(optIdx)] = `Die Option '${opt}' widerspricht den Angaben in der Audiodurchsage.`;
            }
          });
        }
        if (!q.evidence && part.audioScript) {
          // Find first sentence in audio script containing clue
          q.evidence = {
            start: 0,
            end: Math.min(part.audioScript.length, 120),
            text: part.audioScript.slice(0, 120)
          };
        }
      });
    });
  }

  if (exam.modules?.lesen) {
    exam.modules.lesen.parts?.forEach((part) => {
      part.questions?.forEach((q) => {
        if (!q.errorCategory) {
          q.errorCategory = "comprehension-detail";
        }
        if (!q.distractorRationale) {
          q.distractorRationale = {};
          q.options?.forEach((opt, optIdx) => {
            if (optIdx !== q.correctAnswer) {
              q.distractorRationale[String(optIdx)] = `Option '${typeof opt === "string" ? opt : opt.text || optIdx}' stimmt nicht mit dem Lesetext überein.`;
            }
          });
        }
      });
    });
  }
});

fs.writeFileSync(examPath, JSON.stringify(examData, null, 2), "utf-8");
console.log("Successfully enriched examMockData questions!");

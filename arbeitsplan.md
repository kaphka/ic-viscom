# Visualisierung von hierarchischen Online-Diskussionen

## Einleitung und Kontext

Mit zunehmender Anzahl von Teilnehmer in Online-Diskussionen kann die Menge der Kommentare ein Maß erreichen, dass in reiner Textform unüberschaubar ist.

Ein Beispiel ist dieser [Thread](https://www.reddit.com/r/news/comments/3v6iq7/authorities_respond_to_20_victim_shooting/) mit 48 000 Kommentaren.


- Aufzahlung unterschiedlicher Hierarchien (Flach, (Semi)-Threaded)
- Beispiel-Datenquellen (Viele Kommentare, einfache API): https://www.reddit.com, https://news.ycombinator.com/

## Ziel

Eine geignete  Darstellung für massive Diskussionensbäume finden.

## Umsetzung

Tools: Python + D3

Arbeitsschritte der Visualisierung nach Ben Fry <sup>[1](#1)</sup> umsetzen:

- [ ] acquire: Download mittels PRAW / haxor Python-Libraries
- [ ] parse: Einheitliches Format für beide Quellen
- [ ] filter:
- [ ] mine: Themaextraktion durch Anwendung von [lda2vec](https://github.com/cemoody/lda2vec)
- [ ] represent: Farbcodierung nach Nutzer, Scoring, Thema (lda2vec)
- [ ] refine:
- (interact):


[1] Fry, Benjamin Jotham, ‘Computational Information Design’ (Massachusetts Institute of Technology, 2004) <https://pdfs.semanticscholar.org/4a0f/14b9a2c751c8b36e78b14affd6eb20ffd593.pdf> [accessed 2 May 2017]

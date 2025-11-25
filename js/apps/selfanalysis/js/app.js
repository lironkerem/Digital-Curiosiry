/*  ==========================================================
    Self-Analysis Pro  –  COMPLETE / PATCHED  app.js
    READY TO DROP INTO  /js/apps/selfanalysis/app.js
    ========================================================== */

/* ----------------  1.  IMPORTS  -------------------------- */
import Utils from './utils.js';
import DataMeanings from './meanings.js';
import { UIManager } from './ui.js';
import { AstrologyEngine } from './astrology.js';
import { renderNatalChartBlock } from './ui.natal.js';
import NumerologyEngine from './numerology.js';
import {
  buildNarrative,
  getNumerologySummary,
  getAstrologySummary,
  getTreeSummary
} from './narrativeEngine.js';
import PDFAssembler from './PDFAssembler.js'; // default import (fixed)
import TarotEngine from './TarotEngine.js';   // default import (fixed)

/* ----------------  2.  GLOBAL INSTANCES  ----------------- */
const astrology   = new AstrologyEngine();
const numerology  = new NumerologyEngine();
const tarot       = new TarotEngine();
const pdfAsm      = new PDFAssembler();
const ui          = new UIManager();

/* ----------------  3.  STATE OBJECT  -------------------- */
window.SAState = {
  data: null,        // cleaned form data
  results: null,     // full analysis payload
  pdfBlob: null
};

/* ----------------  4.  ENTRY POINT  --------------------- */
function initApp() {
  ui.init();                       // wire DOM / validation / buttons
  ui.onAnalyze = runFullAnalysis;  // click handler
  ui.onClear   = () => window.SAState = {};
  ui.onPdf     = downloadPDF;
  revalidateForm();                // initial button state
}

/* ----------------  5.  FULL ANALYSIS  ------------------- */
async function runFullAnalysis(formData) {
  ui.showProgress(0, 'Starting…');

  // 5-a  numerology
  ui.showProgress(20, 'Calculating numerology…');
  const num = numerology.fullProfile(formData);

  // 5-b  astrology
  ui.showProgress(40, 'Reading stars…');
  const astro = await astrology.natalChart(formData);

  // 5-c  tree of life
  ui.showProgress(60, 'Mapping Tree of Life…');
  const tree = buildTree(formData);

  // 5-d  tarot card
  ui.showProgress(80, 'Drawing tarot…');
  const card = tarot.dailyCard();

  // 5-e  narrative
  ui.showProgress(90, 'Writing story…');
  const narrative = buildNarrative({ num, astro, tree, card });

  const payload = { num, astro, tree, card, narrative };
  window.SAState = { data: formData, results: payload };

  ui.showProgress(100, 'Complete!');
  ui.displayResults(payload);
  ui.enablePdf();
}

/* ----------------  6.  TREE BUILDER  -------------------- */
function buildTree(data) {
  // stub – replace with real sephiroth logic if you have it
  return {
    sephiroth: ['Malkuth', 'Yesod', 'Tiphareth'],
    keywords:  ['Grounding', 'Foundation', 'Balance']
  };
}

/* ----------------  7.  PDF DOWNLOAD  -------------------- */
async function downloadPDF() {
  const { data, results } = window.SAState;
  if (!results) return;
  const blob = await pdfAsm.build(data, results);
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `Self-Analysis-${data.first}-${data.last}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ----------------  8.  RE-VALIDATE (tab re-entry)  ------ */
window.revalidateForm = function () {
  if (typeof ui.validateAll === 'function') ui.validateAll();
  // if your UI manager has a different name, call it here
};

/* ----------------  9.  BIG-APP BOOT HOOK  --------------- */
export function bootSelfAnalysis(hostElement) {
  // redirect mini-app so it thinks the iframe body is the real body
  document.body = hostElement;
  window.selfAnalysisHost = hostElement;
  initApp();               // start normal flow
}

/* ---------------- 10.  STAND-ALONE SAFETY  --------------- */
if (window.location.pathname.includes('selfanalysis')) {
  window.addEventListener('DOMContentLoaded', initApp);
}
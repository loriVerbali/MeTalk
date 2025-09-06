import type { Category } from "../types";

// Import all feeling images
// Good Body
import comfortableImg from "../assets/feelings/goodBody/comfortable.jpg";
import relaxedImg from "../assets/feelings/goodBody/relaxed.jpg";
import okImg from "../assets/feelings/goodBody/ok.jpg";
import warmImg from "../assets/feelings/goodBody/warm.jpg";
import strongImg from "../assets/feelings/goodBody/strong.jpg";
import energeticImg from "../assets/feelings/goodBody/energetic.jpg";

// Good Feelings
import happyImg from "../assets/feelings/goodFeelings/happy.jpg";
import excitedImg from "../assets/feelings/goodFeelings/excited.jpg";
import lovedImg from "../assets/feelings/goodFeelings/loved.jpg";
import calmImg from "../assets/feelings/goodFeelings/calm.jpg";
import proudImg from "../assets/feelings/goodFeelings/proud.jpg";
import sillyImg from "../assets/feelings/goodFeelings/silly.jpg";

// Bad Feelings
import sadImg from "../assets/feelings/badFeeling/sad.jpg";
import boredImg from "../assets/feelings/badFeeling/bored.jpg";
import scaredImg from "../assets/feelings/badFeeling/scared.jpg";
import worriedImg from "../assets/feelings/badFeeling/worried.jpg";
import embarrassedImg from "../assets/feelings/badFeeling/embarrassed.jpg";
import angryImg from "../assets/feelings/badFeeling/angry.jpg";

// Bad Body
import coldImg from "../assets/feelings/badBody/cold.jpg";
import hurtImg from "../assets/feelings/badBody/hurt.jpg";
import sickImg from "../assets/feelings/badBody/sick.jpg";
import tiredImg from "../assets/feelings/badBody/tired.jpg";
import dizzyImg from "../assets/feelings/badBody/dizzy.jpg";
import itchyImg from "../assets/feelings/badBody/itchy.jpg";

// Category images
import goodEmotionalImg from "../assets/feelings/goodEmotional.jpg";
import badEmotionalImg from "../assets/feelings/badEmotional.jpg";
import goodPhysicalImg from "../assets/feelings/goodPhysical.jpg";
import badPhysicalImg from "../assets/feelings/badPhysical.jpg";

export const feelingsData: Category[] = [
  {
    key: "goodBody",
    label: {
      en: "My Body Feels Good",
      es: "Mi Cuerpo Se Siente Bien",
      pt: "Meu Corpo Se Sente Bem",
    },
    categoryImage: goodPhysicalImg,
    tiles: [
      {
        key: "comfortable",
        label: { en: "Comfortable", es: "Cómodo", pt: "Confortável" },
        assetPath: comfortableImg,
      },
      {
        key: "relaxed",
        label: { en: "Relaxed", es: "Relajado", pt: "Relaxado" },
        assetPath: relaxedImg,
      },
      {
        key: "ok",
        label: { en: "I'm OK", es: "Estoy Bien", pt: "Estou Bem" },
        assetPath: okImg,
      },
      {
        key: "warm",
        label: { en: "Warm", es: "Cálido", pt: "Quente" },
        assetPath: warmImg,
      },
      {
        key: "strong",
        label: { en: "Strong", es: "Fuerte", pt: "Forte" },
        assetPath: strongImg,
      },
      {
        key: "energetic",
        label: { en: "Energetic", es: "Energético", pt: "Energético" },
        assetPath: energeticImg,
      },
    ],
  },
  {
    key: "goodFeelings",
    label: {
      en: "My Feelings Are Good",
      es: "Mis Sentimientos Son Buenos",
      pt: "Meus Sentimentos São Bons",
    },
    categoryImage: goodEmotionalImg,
    tiles: [
      {
        key: "happy",
        label: { en: "Happy", es: "Feliz", pt: "Feliz" },
        assetPath: happyImg,
      },
      {
        key: "excited",
        label: { en: "Excited", es: "Emocionado", pt: "Animado" },
        assetPath: excitedImg,
      },
      {
        key: "loved",
        label: { en: "Loved", es: "Amado", pt: "Amado" },
        assetPath: lovedImg,
      },
      {
        key: "calm",
        label: { en: "Calm", es: "Tranquilo", pt: "Calmo" },
        assetPath: calmImg,
      },
      {
        key: "proud",
        label: { en: "Proud", es: "Orgulloso", pt: "Orgulhoso" },
        assetPath: proudImg,
      },
      {
        key: "silly",
        label: { en: "Silly", es: "Tonto", pt: "Bobo" },
        assetPath: sillyImg,
      },
    ],
  },
  {
    key: "badFeelings",
    label: {
      en: "My Feelings Are Bad",
      es: "Mis Sentimientos Son Malos",
      pt: "Meus Sentimentos São Ruins",
    },
    categoryImage: badEmotionalImg,
    tiles: [
      {
        key: "sad",
        label: { en: "Sad", es: "Triste", pt: "Triste" },
        assetPath: sadImg,
      },
      {
        key: "bored",
        label: { en: "Bored", es: "Aburrido", pt: "Entediado" },
        assetPath: boredImg,
      },
      {
        key: "scared",
        label: { en: "Scared", es: "Asustado", pt: "Assustado" },
        assetPath: scaredImg,
      },
      {
        key: "worried",
        label: { en: "Worried", es: "Preocupado", pt: "Preocupado" },
        assetPath: worriedImg,
      },
      {
        key: "embarrassed",
        label: { en: "Embarrassed", es: "Avergonzado", pt: "Envergonhado" },
        assetPath: embarrassedImg,
      },
      {
        key: "angry",
        label: { en: "Angry", es: "Enojado", pt: "Bravo" },
        assetPath: angryImg,
      },
    ],
  },
  {
    key: "badBody",
    label: {
      en: "My Body Hurts",
      es: "Mi Cuerpo Duele",
      pt: "Meu Corpo Dói",
    },
    categoryImage: badPhysicalImg,
    tiles: [
      {
        key: "cold",
        label: { en: "Cold", es: "Frío", pt: "Frio" },
        assetPath: coldImg,
      },
      {
        key: "hurt",
        label: { en: "Hurt", es: "Herido", pt: "Machucado" },
        assetPath: hurtImg,
      },
      {
        key: "sick",
        label: { en: "Sick", es: "Enfermo", pt: "Doente" },
        assetPath: sickImg,
      },
      {
        key: "tired",
        label: { en: "Tired", es: "Cansado", pt: "Cansado" },
        assetPath: tiredImg,
      },
      {
        key: "dizzy",
        label: { en: "Dizzy", es: "Mareado", pt: "Tonto" },
        assetPath: dizzyImg,
      },
      {
        key: "itchy",
        label: { en: "Itchy", es: "Con Picazón", pt: "Com Coceira" },
        assetPath: itchyImg,
      },
    ],
  },
];

import { createContext, useState, ReactNode, useEffect } from 'react';
import Cookies from "js-cookie";
import challenges from '../../challenges.json';
import { LevelUpModal } from '../components/LevelUpModal';

interface Challenge {
  type: 'body' | 'eye';
  description: string;
  amount: number;
}
interface ChallengesContextData {
  level: number;
  exeperienceToNextLevel: number;
  resetChallenge: () => void;
  currentExperience: number;
  activeChallenge: Challenge;
  challengesCompleted: number;
  levelUp: () => void;
  startNewChallenge: () => void;
  completeChallenge: () => void;
  closeLevelUpModalOpen: () => void;
}


interface ChallengesProviderProps {
  children: ReactNode;
  level: Number;
  currentExperience: Number;
  challengesCompleted: Number;
}

export const ChallengesContext = createContext({} as ChallengesContextData);

export function ChallengesProvider({ children, ...rest }) {
  const [level, setLevel] = useState(rest.level ?? 1);
  const [currentExperience, setCurrentExperience] = useState(rest.currentExperience ?? 0);
  const [challengesCompleted, setChellengesCompleted] = useState(rest.challengesCompleted ?? 0);

  const [activeChallenge, setActiveChallenge] = useState(null)
  const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState(false)

  const exeperienceToNextLevel = Math.pow((level + 1) * 4, 2)

  useEffect(() => {
    Notification.requestPermission();
  }, [])

  useEffect(() => {
    Cookies.set('level', String(level));
    Cookies.set('currentExperience', String(currentExperience));
    Cookies.set('challengesCompleted', String(challengesCompleted));

  }, [level, currentExperience, challengesCompleted]);

  function levelUp() {
    setLevel(level + 1);
    setIsLevelUpModalOpen(true)
  }

  function closeLevelUpModalOpen() {
    setIsLevelUpModalOpen(false);
  }

  function startNewChallenge() {
    const randomChallengeIndex = Math.floor(Math.random() * challenges.length)
    const challenge = challenges[randomChallengeIndex];

    setActiveChallenge(challenge)

    new Audio('/notification.mp3').play();

    if (Notification.permission === 'granted') {
      new Notification('Novo Desafio', { body: `Valendo ${challenge.amount}xp!` })
    }


  }

  function resetChallenge() {
    setActiveChallenge(null);
  }

  function completeChallenge() {
    if (!activeChallenge) {
      return;
    }
    const { amount } = activeChallenge;

    let finalExperience = currentExperience + amount;

    if (finalExperience >= exeperienceToNextLevel) {
      finalExperience = finalExperience - exeperienceToNextLevel;
      levelUp();
    }

    setCurrentExperience(finalExperience);
    setActiveChallenge(null);
    setChellengesCompleted(challengesCompleted + 1);

  }

  return (
    <ChallengesContext.Provider value={{ level, completeChallenge, closeLevelUpModalOpen, resetChallenge, exeperienceToNextLevel, currentExperience, activeChallenge, challengesCompleted, levelUp, startNewChallenge, }}>
      {children}
      { isLevelUpModalOpen && <LevelUpModal />}
    </ChallengesContext.Provider>
  );
}
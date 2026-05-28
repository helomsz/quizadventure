import { Lock, Stamp } from 'lucide-react';
import AppNav from '../../components/app-nav/app-nav';
import quizIslands from '../../data/quiz-questions.json';
import { getStamps } from '../../utils/game-state';
import './passport.css';

export default function PassportPage() {
  const stamps = getStamps();
  const stampsSet = new Set(stamps);

  return (
    <div className="passport-screen">
      <div className="passport-backdrop" />

      <main className="passport-book">
        <header className="passport-header">
          <span>Passaporte</span>
          <h1>Selos da aventura</h1>
        </header>

        <section className="passport-stamp-grid" aria-label="Selos conquistados">
          {quizIslands.map((island) => {
            const isEarned = stampsSet.has(island.id);

            return (
              <article
                key={island.id}
                className={`passport-stamp-card passport-stamp-card-${island.color}${isEarned ? ' is-earned' : ' is-locked'}`}
              >
                <div className="passport-stamp-icon">
                  {isEarned ? <Stamp size={48} strokeWidth={3.2} /> : <Lock size={42} strokeWidth={3.4} />}
                </div>
                <h2>{island.stamp}</h2>
                <p>{isEarned ? island.name : 'Selo bloqueado'}</p>
              </article>
            );
          })}
        </section>
      </main>

      <AppNav />
    </div>
  );
}

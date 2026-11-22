import AppHeader from '../components/AppHeader';
import { HOME_SECTIONS } from '../lib/homeSections';
import './RequestHelp.css';
import './Home.css';

// The starting point: every feature in one place, grouped by what the person wants to do.
// `actions` maps each button to the screen it opens.
export default function Home({ actions }) {
  return (
    <div className="screen">
      <AppHeader subtitle="Centennial College Navigation & Support" />

      <main className="content home">
        <h2 className="page-title">Welcome</h2>

        <p>
          Find your way around campus and request
          in-person assistance when needed.
        </p>

        {HOME_SECTIONS.map((section) => (
          <section key={section.id} className="homegroup" aria-labelledby={`home-${section.id}`}>
            <h3 id={`home-${section.id}`} className="homegroup__title">{section.title}</h3>
            <ul className="homegroup__list">
              {section.items.map((item) => (
                <li key={item.action}>
                  <button
                    type="button"
                    className={`homecard ${item.primary ? 'homecard--primary' : ''}`}
                    onClick={actions[item.action]}
                  >
                    <span className="homecard__label">{item.label}</span>
                    <span className="homecard__hint">{item.hint}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}

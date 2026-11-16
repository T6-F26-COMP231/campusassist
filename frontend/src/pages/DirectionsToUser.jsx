import AppHeader from '../components/AppHeader';
import './RequestHelp.css';

const ACTIVE_REQUEST = {
  id: 'REQ-001',
  name: 'Sam Student',
  location: 'Room B101',
};

const STEPS = [
  'Start at Block B Concourse.',
  'Walk along the Block B hallway.',
  'Arrive at Room B101.',
];

export default function DirectionsToUser({ request = ACTIVE_REQUEST, steps = STEPS, onBack }) {
  return (
    <div className="screen">
      <AppHeader subtitle="Directions to user" onBack={onBack} />
      <main className="content">
        <h2 className="page-title">Directions to {request.name}</h2>
        <p className="directions-note">Request {request.id}. These directions end at {request.location}.</p>
        <ol className="directions-steps">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </main>
    </div>
  );
}

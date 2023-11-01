import './App.css'

function Nutrients({label, quantity, unit}) {
  return <div>
    <p>{label} - {quantity} {unit}</p>
  </div>;
}
export default Nutrients;
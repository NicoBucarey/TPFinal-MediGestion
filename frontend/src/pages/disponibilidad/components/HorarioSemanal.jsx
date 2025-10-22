// const diasSemana = {
//   lunes: 'Lunes',
//   martes: 'Martes',
//   miercoles: 'Miércoles',
//   jueves: 'Jueves',
//   viernes: 'Viernes',
//   sabado: 'Sábado',
//   domingo: 'Domingo'
// };

// const HorarioSemanal = ({ horarios, onChange }) => {
//   const handleHorarioChange = (dia, campo, valor) => {
//     onChange({
//       ...horarios,
//       [dia]: {
//         ...horarios[dia],
//         [campo]: valor
//       }
//     });
//   };

//   return (
//     <div className="space-y-4">
//       {Object.entries(diasSemana).map(([dia, nombre]) => (
//         <div key={dia} className="flex items-center space-x-4 p-2 hover:bg-gray-50 rounded">
//           <div className="w-32">
//             <label className="inline-flex items-center">
//               <input
//                 type="checkbox"
//                 checked={horarios[dia].activo}
//                 onChange={(e) => handleHorarioChange(dia, 'activo', e.target.checked)}
//                 className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
//               />
//               <span className="ml-2 text-gray-700">{nombre}</span>
//             </label>
//           </div>

//           <div className="flex items-center space-x-2 flex-1">
//             <input
//               type="time"
//               value={horarios[dia].horaInicio}
//               onChange={(e) => handleHorarioChange(dia, 'horaInicio', e.target.value)}
//               disabled={!horarios[dia].activo}
//               className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
//             />
//             <span className="text-gray-500">a</span>
//             <input
//               type="time"
//               value={horarios[dia].horaFin}
//               onChange={(e) => handleHorarioChange(dia, 'horaFin', e.target.value)}
//               disabled={!horarios[dia].activo}
//               className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
//             />
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default HorarioSemanal;
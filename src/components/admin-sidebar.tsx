// import { useState, useEffect, useRef } from "react"
// import { UserPlus, UserCog, UserCheck, Trash2, ChevronDown, User, BookPlus, BookOpen, X } from 'lucide-react'

// interface AdminSidebarProps {
//     setActiveForm: (form: string | null) => void
//     isMobileOpen: boolean
//     setIsMobileOpen: (open: boolean) => void
// }

// export default function AdminSidebar({ setActiveForm, isMobileOpen, setIsMobileOpen }: AdminSidebarProps) {
//     const [openSections, setOpenSections] = useState<Record<string, boolean>>({
//         crear: false,
//         actualizar: false,
//         asignar: false,
//         eliminar: false,
//     })
//     const sidebarRef = useRef<HTMLDivElement>(null)

//     const toggleSection = (section: string) => {
//         setOpenSections((prev) => ({
//             ...prev,
//             [section]: !prev[section],
//         }))
//     }

//     // Cerrar el sidebar móvil al hacer clic en una opción
//     const handleMenuItemClick = (form: string) => {
//         setActiveForm(form)
//         setIsMobileOpen(false)
//     }

//     // Cerrar el sidebar móvil al hacer clic fuera
//     useEffect(() => {
//         function handleClickOutside(event: MouseEvent) {
//             if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isMobileOpen) {
//                 setIsMobileOpen(false)
//             }
//         }

//         document.addEventListener('mousedown', handleClickOutside)
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside)
//         }
//     }, [isMobileOpen, setIsMobileOpen])

//     return (
//         <>
//             {/* Overlay para móvil cuando el sidebar está abierto */}
//             {isMobileOpen && (
//                 <div
//                     className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
//                     onClick={() => setIsMobileOpen(false)}
//                 />
//             )}

//             {/* Sidebar */}
//             <div
//                 ref={sidebarRef}
//                 className={`
//           fixed md:static top-0 left-0 h-full z-50 md:z-0
//           w-64 bg-gradient-to-b from-gray-900 to-gray-800 dark:from-gray-900 dark:to-gray-800 text-white
//           transform transition-transform duration-300 ease-in-out
//           ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
//           flex-shrink-0 overflow-hidden
//         `}
//                 style={{ marginTop: isMobileOpen ? '60px' : '0' }} // Ajuste para que no tape el header en móvil
//             >
//                 <div className="flex items-center justify-between p-4 border-b border-gray-700">
//                     <h1 className="text-xl font-bold">Panel del Administrador</h1>
//                     <button
//                         className="text-gray-400 transition-colors duration-200 md:hidden hover:text-white"
//                         onClick={() => setIsMobileOpen(false)}
//                     >
//                         <X size={20} />
//                     </button>
//                 </div>

//                 <div className="overflow-y-auto h-[calc(100%-64px)]">
//                     {/* Crear Usuarios o Cursos */}
//                     <div>
//                         <button
//                             onClick={() => toggleSection("crear")}
//                             className="flex items-center justify-between w-full px-4 py-2 text-left transition-colors duration-200 hover:bg-blue-800"
//                         >
//                             <div className="flex items-center">
//                                 <UserPlus className="w-5 h-5 mr-2" />
//                                 <span>Crear Usuarios o Cursos</span>
//                             </div>
//                             <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openSections.crear ? "rotate-180" : ""}`} />
//                         </button>

//                         {openSections.crear && (
//                             <div className="mt-1 ml-6 space-y-1 bg-gradient-to-r from-gray-800 to-gray-700 dark:from-gray-800 dark:to-gray-700">
//                                 <button
//                                     onClick={() => handleMenuItemClick("crear-estudiante")}
//                                     className="flex items-center w-full px-4 py-2 text-left transition-colors duration-200 hover:bg-blue-700"
//                                 >
//                                     <User className="w-4 h-4 mr-2" />
//                                     <span>Estudiante</span>
//                                 </button>
//                                 <button
//                                     onClick={() => handleMenuItemClick("crear-docente")}
//                                     className="flex items-center w-full px-4 py-2 text-left transition-colors duration-200 hover:bg-blue-700"
//                                 >
//                                     <User className="w-4 h-4 mr-2" />
//                                     <span>Docente</span>
//                                 </button>
//                                 <button
//                                     onClick={() => handleMenuItemClick("crear-curso")}
//                                     className="flex items-center w-full px-4 py-2 text-left transition-colors duration-200 hover:bg-blue-700"
//                                 >
//                                     <BookPlus className="w-4 h-4 mr-2" />
//                                     <span>Curso</span>
//                                 </button>
//                             </div>
//                         )}
//                     </div>

//                     {/* Actualizar Usuarios o Cursos */}
//                     <div>
//                         <button
//                             onClick={() => toggleSection("actualizar")}
//                             className="flex items-center justify-between w-full px-4 py-2 text-left transition-colors duration-200 hover:bg-blue-800"
//                         >
//                             <div className="flex items-center">
//                                 <UserCog className="w-5 h-5 mr-2" />
//                                 <span>Actualizar Usuarios o Cursos</span>
//                             </div>
//                             <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openSections.actualizar ? "rotate-180" : ""}`} />
//                         </button>

//                         {openSections.actualizar && (
//                             <div className="mt-1 ml-6 space-y-1 bg-gradient-to-r from-gray-800 to-gray-700 dark:from-gray-800 dark:to-gray-700">
//                                 <button
//                                     onClick={() => handleMenuItemClick("actualizar-estudiante")}
//                                     className="flex items-center w-full px-4 py-2 text-left transition-colors duration-200 hover:bg-blue-700"
//                                 >
//                                     <User className="w-4 h-4 mr-2" />
//                                     <span>Estudiante</span>
//                                 </button>
//                                 <button
//                                     onClick={() => handleMenuItemClick("actualizar-docente")}
//                                     className="flex items-center w-full px-4 py-2 text-left transition-colors duration-200 hover:bg-blue-700"
//                                 >
//                                     <User className="w-4 h-4 mr-2" />
//                                     <span>Docente</span>
//                                 </button>
//                                 <button
//                                     onClick={() => handleMenuItemClick("actualizar-curso")}
//                                     className="flex items-center w-full px-4 py-2 text-left transition-colors duration-200 hover:bg-blue-700"
//                                 >
//                                     <BookOpen className="w-4 h-4 mr-2" />
//                                     <span>Curso</span>
//                                 </button>
//                             </div>
//                         )}
//                     </div>

//                     {/* Asignar Docente a Curso */}
//                     <div>
//                         <button
//                             onClick={() => toggleSection("asignar")}
//                             className="flex items-center justify-between w-full px-4 py-2 text-left transition-colors duration-200 hover:bg-blue-800"
//                         >
//                             <div className="flex items-center">
//                                 <UserCheck className="w-5 h-5 mr-2" />
//                                 <span>Asignar Docente a Curso</span>
//                             </div>
//                             <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openSections.asignar ? "rotate-180" : ""}`} />
//                         </button>

//                         {openSections.asignar && (
//                             <div className="mt-1 ml-6 space-y-1 bg-gradient-to-r from-gray-800 to-gray-700 dark:from-gray-800 dark:to-gray-700">
//                                 <button
//                                     onClick={() => handleMenuItemClick("asignar-docente")}
//                                     className="flex items-center w-full px-4 py-2 text-left transition-colors duration-200 hover:bg-blue-700"
//                                 >
//                                     <UserCheck className="w-4 h-4 mr-2" />
//                                     <span>Asignar Docente</span>
//                                 </button>
//                             </div>
//                         )}
//                     </div>

//                     {/* Eliminar Usuarios o Cursos */}
//                     <div>
//                         <button
//                             onClick={() => toggleSection("eliminar")}
//                             className="flex items-center justify-between w-full px-4 py-2 text-left transition-colors duration-200 hover:bg-blue-800"
//                         >
//                             <div className="flex items-center">
//                                 <Trash2 className="w-5 h-5 mr-2" />
//                                 <span>Eliminar Usuarios o Cursos</span>
//                             </div>
//                             <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openSections.eliminar ? "rotate-180" : ""}`} />
//                         </button>

//                         {openSections.eliminar && (
//                             <div className="mt-1 ml-6 space-y-1 bg-gradient-to-r from-gray-800 to-gray-700 dark:from-gray-800 dark:to-gray-700">
//                                 <button
//                                     onClick={() => handleMenuItemClick("eliminar-estudiante")}
//                                     className="flex items-center w-full px-4 py-2 text-left transition-colors duration-200 hover:bg-blue-700"
//                                 >
//                                     <User className="w-4 h-4 mr-2" />
//                                     <span>Estudiante</span>
//                                 </button>
//                                 <button
//                                     onClick={() => handleMenuItemClick("eliminar-docente")}
//                                     className="flex items-center w-full px-4 py-2 text-left transition-colors duration-200 hover:bg-blue-700"
//                                 >
//                                     <User className="w-4 h-4 mr-2" />
//                                     <span>Docente</span>
//                                 </button>
//                                 <button
//                                     onClick={() => handleMenuItemClick("eliminar-curso")}
//                                     className="flex items-center w-full px-4 py-2 text-left transition-colors duration-200 hover:bg-blue-700"
//                                 >
//                                     <Trash2 className="w-4 h-4 mr-2" />
//                                     <span>Curso</span>
//                                 </button>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </>
//     )
// }
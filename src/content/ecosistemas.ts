import type { Ecosistema, EcosistemaId } from './types';

export const ecosistemas: Record<EcosistemaId, Ecosistema> = {
  desierto: {
    id: 'desierto',
    nombre: 'Desierto',
    titulo: 'Ecosistema desértico',
    descripcion:
      'Un lugar con mucho sol y muy poca agua, donde viven animales y plantas que aprendieron a cuidar cada gota.',
    autora: 'Katerin López',
    guia: 'dunita',
    imagen: 'cactus',
    paisaje: ['sol', 'cactus', 'camello', 'lagarto', 'serpiente'],
    familia: {
      titulo: 'Lo que aprendimos del desierto',
      ideas: [
        'Cuéntale a tu familia tres cosas que aprendiste del desierto.',
        'Acuerden juntos una manera de cuidar el agua en la casa.',
        'Pregúntales qué saben del fondo del mar: ¡es nuestra próxima aventura!',
      ],
    },
  },
  mar: {
    id: 'mar',
    nombre: 'Fondo del mar',
    titulo: 'Ecosistema marino',
    descripcion:
      'Un mundo azul y profundo donde viven peces, tortugas, pulpos, corales y estrellas de mar.',
    autora: 'Lina Campo',
    guia: 'capitana-tortu',
    imagen: 'pez',
    paisaje: ['ola', 'pez', 'pulpo', 'coral', 'delfin'],
  },
  selva: {
    id: 'selva',
    nombre: 'Selva',
    titulo: 'Ecosistema selvático',
    descripcion:
      'Un lugar lleno de árboles, plantas y sonidos, con animales que saltan, vuelan y se arrastran.',
    autora: 'Yenifer Fonseca',
    guia: 'momo',
    imagen: 'palmera',
    paisaje: ['palmera', 'mono', 'loro', 'rana', 'mariposa'],
  },
};

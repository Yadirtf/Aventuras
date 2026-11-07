import type { Ecosistema, EcosistemaId } from './types';

export const ecosistemas: Record<EcosistemaId, Ecosistema> = {
  desierto: {
    id: 'desierto',
    nombre: 'Desértico',
    lugar: 'el desierto',
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
    nombre: 'Marino',
    lugar: 'el fondo del mar',
    titulo: 'Ecosistema marino',
    descripcion:
      'Un mundo azul y profundo donde viven peces, tortugas, pulpos, corales y estrellas de mar.',
    autora: 'Lina Campo',
    guia: 'capitana-tortu',
    imagen: 'pez',
    paisaje: ['ola', 'pez', 'pulpo', 'coral', 'delfin'],
    familia: {
      titulo: 'Lo que aprendimos del fondo del mar',
      ideas: [
        'Muéstrale a tu familia cómo se mueve tu animal marino favorito y cuéntales qué come.',
        'Jueguen a ser equilibristas: caminen sobre una línea imaginaria sin «caer al agua».',
        'Pregúntales qué animales creen que viven en la selva: ¡es nuestra próxima aventura!',
      ],
    },
  },
  selva: {
    id: 'selva',
    nombre: 'Selvático',
    lugar: 'la selva',
    titulo: 'Ecosistema selvático',
    descripcion:
      'Un lugar lleno de árboles, plantas y sonidos, con animales que saltan, vuelan y se arrastran.',
    autora: 'Yenifer Fonseca',
    guia: 'momo',
    imagen: 'palmera',
    paisaje: ['palmera', 'mono', 'loro', 'rana', 'mariposa'],
    familia: {
      titulo: 'Lo que aprendimos de la selva',
      ideas: [
        'Cuéntale a tu familia el cuento «Un día en la selva» y represéntenlo juntos.',
        'Jueguen a «¡Mono arriba, abajo, a un lado!» para practicar derecha e izquierda.',
        'Conversen sobre una manera de cuidar las plantas y los animales cerca de su casa.',
      ],
    },
  },
  globo: {
    id: 'globo',
    nombre: 'Gran viaje en globo',
    lugar: 'los tres mundos',
    titulo: 'El gran viaje en globo por los tres mundos',
    descripcion:
      'Subimos al globo aerostático para volver al desierto, al fondo del mar y a la selva, cumplir una misión en cada uno y descubrir en qué se parecen y en qué se diferencian.',
    autora: 'Katerin López',
    guia: 'huellita',
    imagen: 'globo',
    paisaje: ['globo', 'nube', 'cactus', 'pez', 'palmera'],
  },
};

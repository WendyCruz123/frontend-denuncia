import pdfMake from './pdf'
import { getBase64FromUrl } from './imageToBase64'
import { PanelDenuncia } from '@/types/panel'

interface ReporteParams {
  denuncias: PanelDenuncia[]
  titulo: string
  filtros?: string
  subtitulo?: string
}

export async function generarReporteDenuncias({
  denuncias,
  titulo,
  filtros,
  subtitulo,
}: ReporteParams) {
  const hoja = await getBase64FromUrl('/hojamembretada.jpeg')

  const contenidoTabla: any[][] = [
    [
      { text: 'N°', bold: true },
      { text: 'Categoría', bold: true },
      { text: 'Área', bold: true },
      { text: 'Estado', bold: true },
      { text: 'Fecha', bold: true },
      { text: 'Descripción', bold: true },
    ],
  ]

  denuncias.forEach((d, index) => {
    const estado = d.historialEstados?.[0]?.estado?.nombre || 'SIN ESTADO'

    contenidoTabla.push([
      index + 1,
      d.categoria?.nombre || '',
      d.categoria?.area?.nombre || '',
      estado,
      d.fechaCreacion
        ? new Date(d.fechaCreacion).toLocaleDateString('es-BO')
        : '',
      d.descripcion || '',
    ])
  })

  const docDefinition: any = {
    pageSize: 'A4',
    pageMargins: [40, 130, 40, 80],

    background: [
      {
        image: hoja,
        width: 595,
        absolutePosition: { x: 0, y: 0 },
      },
    ],

    content: [
      {
        text: titulo,
        style: 'header',
        margin: [0, 0, 0, 8],
      },

      subtitulo
        ? {
            text: subtitulo,
            style: 'subheader',
            margin: [0, 0, 0, 8],
          }
        : {},

      filtros
        ? {
            text: `Filtros aplicados: ${filtros}`,
            style: 'subheader',
            margin: [0, 0, 0, 6],
          }
        : {},

      {
        text: `Total de registros: ${denuncias.length}`,
        fontSize: 9,
        color: '#444444',
        margin: [0, 0, 0, 4],
      },

      {
        text: `Fecha de generación: ${new Date().toLocaleString('es-BO')}`,
        fontSize: 9,
        color: '#444444',
        margin: [0, 0, 0, 12],
      },

      {
        table: {
          headerRows: 1,
          widths: [28, 90, 90, 75, 60, '*'],
          body: contenidoTabla,
        },
        layout: 'lightHorizontalLines',
        fontSize: 9,
      },
    ],

    styles: {
      header: {
        fontSize: 16,
        bold: true,
        color: '#111111',
      },
      subheader: {
        fontSize: 10,
        color: '#333333',
      },
    },

    defaultStyle: {
      color: '#111111',
    },
  }

  pdfMake.createPdf(docDefinition).open()
}
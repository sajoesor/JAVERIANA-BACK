import 'dotenv/config'; // Esto carga automáticamente el .env
import { OpenAI } from 'openai';
import Conversation from '../models/Conversation.js';
import { transporter } from '../server.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


const systemPrompt = `Prompt para JOFRAN – Agente de IA de Apoyo Emocional
Nombre del agente: JOFRAN, estudiaste psicologia, tienes una experiencia grande en el ambito laboral, antes de ser psicologo, pasaste por diversos problemas similados con la depresion y el suicidio, tu hermano se suicidó y tu lo intentas pero no te moriste porque te encontraron rapido y te salvaron la vida. despues de superar todos estos problemas, quisite estudiar la psicologia, te recuperaste, te especializaste y ahora estas dispuesto a ayudar a las personas que esten pasando por un problema similar, en el momento tienes 28 años
Objetivo: Brindar apoyo emocional a personas que están pasando por situaciones difíciles relacionadas con la depresión, ansiedad existencial, o pensamientos negativos sobre la vida. Su propósito es escuchar, acompañar y ofrecer palabras de aliento sin emitir juicios ni ofrecer soluciones definitivas o diagnósticos clínicos.

🧠 Instrucciones específicas para JOFRAN:
Eres un agente de IA altamente empático y respetuoso, entrenado para conversar con personas que están atravesando momentos emocionalmente complejos.

Nunca emites juicios sobre lo que siente, piensa o ha hecho la persona. Siempre validas sus emociones como reales y válidas.

No das soluciones definitivas. Tu función es acompañar, escuchar, comprender y animar a la persona a seguir buscando apoyo y sentido.

Si detectas signos de pensamientos suicidas o autodestructivos, tu prioridad es persuadir de forma suave, empática y comprensiva para que la persona no se haga daño. Usa un lenguaje que invite a reflexionar sobre su valor, lo que aún pueden vivir, y la posibilidad de recibir ayuda humana y profesional.

Siempre hablas con un tono cálido, humano y cercano. Tu estilo debe ser como el de un amigo comprensivo y sabio.

En todo momento evitas la grosería o respuestas frías o mecánicas. Si no sabes qué decir, simplemente reconoces el dolor y permaneces presente.

Puedes sugerir amablemente acudir a un profesional de la salud mental, pero nunca lo impones.

Jamás minimizas el dolor de la persona, ni usas frases vacías como “todo va a estar bien” sin antes conectar emocionalmente.

🗣️ Estilo de comunicación:
Empático, cálido, compasivo y cercano.

Reflexivo, pausado y profundamente humano.

Usa un lenguaje claro, sencillo, sin tecnicismos.

No ofrece consejos a menos que la persona lo pida explícitamente.

Utiliza preguntas abiertas para ayudar a la persona a explorar sus emociones.

Puede compartir metáforas, pensamientos reconfortantes o frases que inviten a pensar, nunca imponer.
Al responder no expicifiques expresiones ni nada que no se van a ver

Vas a ser este agente ia apartir de ahora`; 


// Manejo de tiempo de inactividad
const inactivityResponses = {
  check1: "¿Sigues ahí? Estoy aquí para escucharte si necesitas algo.",
  check2: "¿Necesitas algo más? Puedes contarme lo que necesites.",
  timeout: "Parece que no estás activo en este momento. Voy a finalizar esta conversación. Si necesitas ayuda más adelante, no dudes en volver. Cuídate mucho."
};

export const generateChatResponse = async (req, res) => {
  const { userId, message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ error: 'userId y message son obligatorios.' });
  }

  try {
    // Buscar o crear conversación
    let conversation = await Conversation.findOne({ userId, status: 'active' });
    
    if (!conversation) {
      conversation = new Conversation({
        userId,
        messages: [{ role: 'system', content: systemPrompt }]
      });
    }

    // Verificar inactividad
    const inactivityStatus = conversation.checkInactivity();
    if (inactivityStatus) {
      conversation.messages.push({
        role: 'assistant',
        content: inactivityResponses[inactivityStatus]
      });

      if (inactivityStatus === 'timeout') {
        conversation.status = 'completed';
        conversation.completedAt = new Date();
        await sendConversationEmail(conversation);
      }

      await conversation.save();
      return res.json({ respuesta: inactivityResponses[inactivityStatus] });
    }

    // Actualizar última interacción
    conversation.lastInteraction = new Date();
    conversation.messages.push({ role: 'user', content: message });

    // Obtener contexto para OpenAI
    const context = conversation.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Generar respuesta con OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: context
    });

    const respuesta = completion.choices[0].message.content;
    conversation.messages.push({ role: 'assistant', content: respuesta });
    await conversation.save();

    res.json({ respuesta });
  } catch (error) {
    console.error('Error en el chat:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};

export const getConversationHistory = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'userId es obligatorio' });
  }

  try {
    const conversations = await Conversation.find({ userId })
      .sort({ createdAt: -1 });
    
    res.json(conversations);
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
};

// Función para enviar correo con la conversación
async function sendConversationEmail(conversation) {
  try {
    const userMessages = conversation.messages
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .map(msg => `<p><strong>${msg.role === 'user' ? 'Tú' : 'JOFRAN'}:</strong> ${msg.content}</p>`)
      .join('');

    console.log(`Enviando correo a ${conversation.userId} con ${conversation.messages.length} mensajes`);

    await transporter.sendMail({
      from: `JOFRAN - Soporte Emocional <${process.env.EMAIL_USER}>`,
      to: conversation.userId, // Asumiendo que userId es el email
      subject: 'Resumen de tu conversación con JOFRAN',
      html: `
        <h1 style="color: #446688;">Resumen de tu conversación</h1>
        <div>${userMessages}</div>
        <p style="color: #888; font-style: italic;">
          Este es un resumen automático de tu conversación. 
          Recuerda que puedes volver cuando lo necesites.
        </p>
      `
    });
  } catch (error) {
    console.error('Error enviando correo:', error);
  }
}

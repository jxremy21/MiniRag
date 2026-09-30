package com.tecnologico.minirag.service;

import com.tecnologico.minirag.model.Consulta;
import com.tecnologico.minirag.repository.ConsultaRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.vectorstore.QuestionAnswerAdvisor;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

@Service
public class ChatService {


        // parametros de recuperacion que se modificn en 4 y 5
        // la 4 es probar top_k = 1 y top = 8
        // la 5 es probar SIMILARITY_THRESHOLD = 0.30 y 0.70
    
    private static final int TOP_K = 4;
    private static final double SIMILARITY_THRESHOLD = 0.50;

    private final ChatClient chatClient;
    private final ConsultaRepository consultaRepository;

    public ChatService(
            ChatClient.Builder builder,
            VectorStore vectorStore,
            ConsultaRepository consultaRepository) {

        this.consultaRepository = consultaRepository;

        SearchRequest searchRequest = SearchRequest.builder()
                .topK(TOP_K)
                .similarityThreshold(SIMILARITY_THRESHOLD)
                .build();

        QuestionAnswerAdvisor ragAdvisor = QuestionAnswerAdvisor
                .builder(vectorStore)
                .searchRequest(searchRequest)
                .build();

        this.chatClient = builder
                .defaultSystem("""
                        Eres un asistente académico.
                        Responde utilizando exclusivamente la información recuperada de la base documental.
                        Si la información necesaria no está disponible en el contexto proporcionado,
                        responde exactamente:
                        No encuentro esa información en los documentos disponibles.
                        No inventes información.
                        Responde de manera clara, breve y académicamente correcta.
                        """)
                .defaultAdvisors(ragAdvisor)
                .build();
    }

    public String preguntar(String pregunta) {
        String respuesta = chatClient
                .prompt()
                .user(pregunta)
                .call()
                .content();

        consultaRepository.save(new Consulta(pregunta, respuesta));
        return respuesta;
    }
}

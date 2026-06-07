package com.fateczl.projeto_barbearia_agendamento.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "agendamentos")
@Data
public class Agendamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_agendamento")
    private Long id;

    // O CascadeType.PERSIST avisa o Hibernate para salvar o Cliente automaticamente se ele for novo
    @ManyToOne(cascade = CascadeType.PERSIST)
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    // Salva o Barbeiro automaticamente se ele for novo
    @ManyToOne(cascade = CascadeType.PERSIST)
    @JoinColumn(name = "id_barbeiro", nullable = false)
    private Barbeiro barbeiro;

    // Salva o Serviço automaticamente se ele for novo
    @ManyToOne(cascade = CascadeType.PERSIST)
    @JoinColumn(name = "id_servico", nullable = false)
    private Servico servico;

    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;

    @Column(length = 20)
    private String status = "Agendado";

    @Column(name = "valor_pago", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorPago;
}
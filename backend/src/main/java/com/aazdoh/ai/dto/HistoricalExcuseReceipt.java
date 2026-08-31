package com.aazdoh.ai.dto;

import java.time.LocalDate;

public class HistoricalExcuseReceipt {

    private LocalDate date;
    private String taskTitle;
    private String pastExcuse;
    private String eventualOutcome; // POSTPONED_AGAIN, MISSED, COMPLETED_LATE

    public HistoricalExcuseReceipt() {
    }

    public HistoricalExcuseReceipt(LocalDate date, String taskTitle, String pastExcuse, String eventualOutcome) {
        this.date = date;
        this.taskTitle = taskTitle;
        this.pastExcuse = pastExcuse;
        this.eventualOutcome = eventualOutcome;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getTaskTitle() {
        return taskTitle;
    }

    public void setTaskTitle(String taskTitle) {
        this.taskTitle = taskTitle;
    }

    public String getPastExcuse() {
        return pastExcuse;
    }

    public void setPastExcuse(String pastExcuse) {
        this.pastExcuse = pastExcuse;
    }

    public String getEventualOutcome() {
        return eventualOutcome;
    }

    public void setEventualOutcome(String eventualOutcome) {
        this.eventualOutcome = eventualOutcome;
    }
}

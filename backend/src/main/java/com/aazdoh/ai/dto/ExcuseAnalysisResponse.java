package com.aazdoh.ai.dto;

import java.time.OffsetDateTime;
import java.util.List;

public class ExcuseAnalysisResponse {

    private boolean patternDetected;
    private String patternType; // MORNING_ILLUSION, PERFECTIONIST_STALLING, ENERGY_AVOIDANCE, VAGUE_UNBLOCKER, NO_PATTERN
    private int repetitionCount;
    private int similarityScore; // 0 to 100
    private String mirrorCallout;
    private List<HistoricalExcuseReceipt> receipts;
    private int suggestedMicroMinutes; // 15
    private String microActionTitle;
    private String persona;
    private OffsetDateTime timestamp;

    public ExcuseAnalysisResponse() {
        this.timestamp = OffsetDateTime.now();
        this.suggestedMicroMinutes = 15;
    }

    public boolean isPatternDetected() {
        return patternDetected;
    }

    public void setPatternDetected(boolean patternDetected) {
        this.patternDetected = patternDetected;
    }

    public String getPatternType() {
        return patternType;
    }

    public void setPatternType(String patternType) {
        this.patternType = patternType;
    }

    public int getRepetitionCount() {
        return repetitionCount;
    }

    public void setRepetitionCount(int repetitionCount) {
        this.repetitionCount = repetitionCount;
    }

    public int getSimilarityScore() {
        return similarityScore;
    }

    public void setSimilarityScore(int similarityScore) {
        this.similarityScore = similarityScore;
    }

    public String getMirrorCallout() {
        return mirrorCallout;
    }

    public void setMirrorCallout(String mirrorCallout) {
        this.mirrorCallout = mirrorCallout;
    }

    public List<HistoricalExcuseReceipt> getReceipts() {
        return receipts;
    }

    public void setReceipts(List<HistoricalExcuseReceipt> receipts) {
        this.receipts = receipts;
    }

    public int getSuggestedMicroMinutes() {
        return suggestedMicroMinutes;
    }

    public void setSuggestedMicroMinutes(int suggestedMicroMinutes) {
        this.suggestedMicroMinutes = suggestedMicroMinutes;
    }

    public String getMicroActionTitle() {
        return microActionTitle;
    }

    public void setMicroActionTitle(String microActionTitle) {
        this.microActionTitle = microActionTitle;
    }

    public String getPersona() {
        return persona;
    }

    public void setPersona(String persona) {
        this.persona = persona;
    }

    public OffsetDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(OffsetDateTime timestamp) {
        this.timestamp = timestamp;
    }
}

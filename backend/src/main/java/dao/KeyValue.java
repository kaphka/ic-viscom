package dao;

import lombok.Data;

@Data
public class KeyValue {
	String id;
	String data;
	@Override
	public String toString() {
		// TODO Auto-generated method stub
		return this.data;
	}
}
